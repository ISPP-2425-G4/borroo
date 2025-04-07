from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status, filters
from .models import Rent, RentStatus, Item, PaymentStatus, User
from .serializers import RentSerializer
from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q


def is_authorized(condition=True, authenticated=True):
    if not authenticated:
        raise NotAuthenticated(
            {'error': 'Debes iniciar sesión.'})
    elif not condition:
        raise PermissionDenied(
            {'error': 'No tienes permisos para realizar esta acción.'})


def apply_penalty(rent):
    penalty = Decimal(str(rent.total_price)) * Decimal("0.10")
    rent.total_price = float(Decimal(str(rent.total_price)) + penalty)
    return rent.total_price


def apply_refund(cancel_type, days_diff):
    minimum_days = {
        # 1.00 = 100%
        'flexible': [(1, Decimal("1.00")), (0, Decimal("0.80"))],
        'medium': [(2, Decimal("1.00")), (1, Decimal("0.50"))],
        'strict': [(7, Decimal("0.50"))],
    }
    for threshold, refund in minimum_days.get(cancel_type, []):
        if days_diff >= threshold:
            return refund
    return Decimal("0.00")


class RentViewSet(viewsets.ModelViewSet):
    queryset = Rent.objects.all()
    serializer_class = RentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['payment_status']
    ordering_fields = ['total_price', 'start_date']
    ordering = ['-start_date']

    def get_queryset(self):
        authenticated = self.request.user.is_authenticated
        user = self.request.user if authenticated else None
        permission = True
        pk = self.kwargs.get('pk')

        if pk is not None:
            rent = Rent.objects.filter(pk=pk).first()

            if rent is None:
                raise NotFound({'error': 'El alquiler no existe.'})
            permission = rent.renter == user

        is_authorized(condition=permission, authenticated=authenticated)
        return Rent.objects.filter(renter=user)

    @action(detail=False, methods=['get'], url_path=r'item/(?P<pk>\d+)')
    def rentas_por_item(self, request, pk=None):
        item = get_object_or_404(Item, pk=pk)
        rents = Rent.objects.filter(item=item)
        serializer = RentSerializer(rents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def first_request(self, request, *args, **kwargs):
        item_id = request.data.get('item')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        user_id = request.data.get('renter')

        user = get_object_or_404(User, pk=user_id)
        item = get_object_or_404(Item, pk=item_id)

        # Verificar campos obligatorios
        if not all([item_id, start_date, end_date, user_id]):
            return Response(
                {'error': 'Faltan campos obligatorios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        not_rent_yourself = user != item.user
        is_authorized(condition=not_rent_yourself)

        # Bloquear si hay rentas en estado que implica que ya está reservado
        conflicting_rents = Rent.objects.filter(
            item=item,
            start_date__lte=end_date,
            end_date__gte=start_date,
            rent_status__in=[
                RentStatus.ACCEPTED,
                RentStatus.BOOKED,
                RentStatus.PICKED_UP
            ]
        )
        if conflicting_rents.exists():
            return Response(
                {'error': 'El objeto no está disponible en esas fechas'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar que no tenga una REQUESTED propia en fechas solapadas
        already_requested = Rent.objects.filter(
            item=item,
            renter=user,
            rent_status=RentStatus.REQUESTED,
            start_date__lte=end_date,
            end_date__gte=start_date
        )
        if already_requested.exists():
            return Response(
                {
                    'error': (
                        'Ya tienes una solicitud pendiente para este objeto '
                        'en esas fechas'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(renter=user, item=item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def respond_request(self, request, pk=None):
        rent_id = request.data.get('rent')
        response = request.data.get("response")
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {
                    "error": "No se proporcionó el 'user_id' en el cuerpo de "
                             "la solicitud."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        rent = get_object_or_404(Rent, pk=rent_id)
        user = get_object_or_404(User, pk=user_id)

        # Validación de permisos
        if user != rent.item.user:
            return Response(
                {"error": "No tienes permisos para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Solo si está en REQUESTED
        if rent.rent_status != RentStatus.REQUESTED:
            return Response(
                {
                    "error": "Solo puedes responder solicitudes en estado "
                             "REQUESTED."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # is_owner = user == rent.item.user
        # is_authorized(condition=is_owner, authenticated=authenticated)

        if response == "accepted":
            rent.rent_status = RentStatus.ACCEPTED
            rent.save()

            # Cancelar otras solicitudes REQUESTED solapadas
            overlapping_requests = Rent.objects.filter(
                item=rent.item,
                rent_status=RentStatus.REQUESTED,
                start_date__lt=rent.end_date,
                end_date__gt=rent.start_date
            ).exclude(pk=rent.pk)

            overlapping_requests.update(rent_status=RentStatus.CANCELLED)

            return Response({
                'status': (
                    'Solicitud aceptada. Solicitudes solapadas canceladas.'
                )
            })

        elif response == "rejected":
            rent.rent_status = RentStatus.CANCELLED
            rent.save()
            return Response(
                {'status': 'Solicitud rechazada. El alquiler se ha cancelado.'}
            )

        else:
            return Response(
                {'error': 'La respuesta debe ser "accepted" o "rejected".'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['put'])
    def change_status(self, request, pk=None):
        rent = self.get_object()
        response = request.data.get("response")
        now = timezone.now()
        # cambiar este user
        user = self.request.user if not AnonymousUser else None
        authenticated = self.request.user.is_authenticated
        is_renter = (user == rent.renter)
        is_owner = (user == rent.item.user)

        if rent.rent_status == RentStatus.CANCELLED:
            raise PermissionDenied(
                {"error": "Alquiler cancelado. No se puede modificar."})

        if (rent.rent_status == RentStatus.ACCEPTED
                and rent.payment_status == PaymentStatus.PAID):
            return self._handle_accepted(rent)

        if response == "PICKED_UP":
            return self._handle_picked_up(rent, now, is_renter, authenticated)

        if response == "RETURNED":
            return self._handle_returned(rent, now, is_owner, authenticated)

        raise PermissionDenied({"error": "Acción no reconocida."})

    def _handle_accepted(self, rent):
        # Caso: pasar de ACCEPTED a BOOKED (tras pago)
        rent.rent_status = RentStatus.BOOKED
        rent.save()
        return Response({"status": "Alquiler reservado. El objeto ha sido "
                         "reservado."})

    def _handle_picked_up(self, rent, now, is_renter, authenticated):
        # Caso: pasar de BOOKED a PCIKED_UP (dentro de la fecha)
        is_authorized(condition=is_renter, authenticated=authenticated)
        if now < rent.start_date:
            raise PermissionDenied({"error": "Aún no es el día para entregar "
                                    "el objeto."})
        refund_window = timedelta(minutes=30)
        if now > rent.start_date:
            if now <= rent.start_date + refund_window:
                refund = Decimal(str(rent.total_price)) * Decimal("0.10")
                rent.total_price = float(Decimal(str(rent.total_price))
                                         - refund)
            else:
                raise PermissionDenied({"error": "El tiempo para obtener el "
                                        "reembolso ha expirado."})
        rent.rent_status = RentStatus.PICKED_UP
        rent.save()
        return Response({"status": "Objeto entregado. El objeto ha sido "
                         "entregado."})

    def _handle_returned(self, rent, now, is_owner, authenticated):
        # Caso: pasar de PICKED_UP a RETURNED (dentro de la fecha)
        is_authorized(condition=is_owner, authenticated=authenticated)
        if now < rent.start_date:
            raise PermissionDenied({"error": "Aún no es el día para devolver "
                                    "el objeto."})
        if now > rent.end_date:
            apply_penalty(rent)
        rent.rent_status = RentStatus.RETURNED
        rent.save()
        return Response({"status": "Objeto devuelto. El objeto ha sido "
                         "devuelto."})

    @action(detail=True, methods=['put'])
    def cancel_rent(self, request, pk=None):
        # hay que cambiar user
        user = request.user if not AnonymousUser else None
        authenticated = request.user.is_authenticated
        now = timezone.now()
        rent = self.get_object()
        renter = rent.renter
        permission = renter == user
        is_authorized(condition=True, authenticated=authenticated)

        if rent.rent_status in [RentStatus.REQUESTED, RentStatus.ACCEPTED]:
            rent.rent_status = RentStatus.CANCELLED
            rent.save()
            return Response({'status': 'Alquiler cancelado exitosamente'})

        elif rent.rent_status == RentStatus.BOOKED:
            days_diff = (rent.start_date.date() - now.date()).days
            cancel_type = rent.item.cancel_type
            refund_percentage = apply_refund(cancel_type, days_diff)
            refund_amount = Decimal(str(rent.total_price)) * refund_percentage
            rent.rent_status = RentStatus.CANCELLED
            rent.save()
            return Response({
                'status': 'Alquiler cancelado exitosamente en estado BOOKED',
                'refund_percentage': str(refund_percentage),
                'refund_amount': str(refund_amount)})

        else:
            raise Response(
                {'error': 'No se puede cancelar un alquiler en este estado'})

    def destroy(self, request, *args, **kwargs):
        rent = self.get_object()
        renter = rent.renter
        authenticated = self.request.user.is_authenticated
        user = self.request.user if authenticated else None
        permission = renter == user
        is_authorized(condition=permission, authenticated=authenticated)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def rental_requests(self, request):
        user_id = request.query_params.get("user")
        rental_requests = Rent.objects.filter(item__user=user_id)
        serializer = RentSerializer(rental_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        user_id = request.query_params.get("user")
        my_requests = Rent.objects.filter(
            Q(renter=user_id)
            )
        serializer = RentSerializer(my_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='has-rented-from')
    def has_rented_from(self, request):
        renter_username = request.query_params.get("renter")
        owner_username = request.query_params.get("owner")

        if not renter_username or not owner_username:
            return Response(
                {"error":
                    "Faltan parámetros: 'renter' y 'owner' son requeridos."},
                status=status.HTTP_400_BAD_REQUEST
            )

        has_rented = Rent.objects.filter(
            renter__username=renter_username,
            item__user__username=owner_username,
            paid_pending_confirmation__is_confirmed_by_renter=None
        ).filter(
            Q(rent_status__in=[
                RentStatus.BOOKED,
                RentStatus.PICKED_UP,
                RentStatus.RETURNED
            ]) | Q(rent_status=RentStatus.ACCEPTED,
                   payment_status=PaymentStatus.PAID)
        ).exists()

        return Response({"has_rented": has_rented})

    @action(detail=False, methods=['get'], url_path='closed-requests')
    def closed_requests(self, request):
        user_id = request.query_params.get("user")

        if not user_id:
            return Response(
                {"error": "El parámetro 'user' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        closed_rents = Rent.objects.filter(
            Q(paid_pending_confirmation__is_confirmed_by_renter=True) & (
                Q(item__user_id=user_id) | Q(renter_id=user_id)
            )
        )

        serializer = RentSerializer(closed_rents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
