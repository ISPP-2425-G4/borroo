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
            {'error': 'Debes iniciar sesión.'}, status=401)
    elif not condition:
        raise PermissionDenied(
            {'error': 'No tienes permisos para realizar esta acción.'})


def apply_penalty(rent):
    penalty = Decimal(str(rent.total_price)) * Decimal("0.10")
    rent.total_price = float(Decimal(str(rent.total_price)) + penalty)
    return rent.total_price


def apply_refund(cancel_type, days_diff):
    thresholds = {
        'flexible': [(2, Decimal("1.00")), (1, Decimal("0.50"))],
        'medium': [(7, Decimal("1.00")), (3, Decimal("0.50"))],
        'strict': [(30, Decimal("1.00")), (14, Decimal("0.50"))],
    }
    for threshold, refund in thresholds.get(cancel_type, []):
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

        not_rent_yourself = user != item.user

        is_authorized(condition=not_rent_yourself)

        if item.price_category == "hour":
            overlapping = Rent.objects.filter(
                item=item,
                start_date__lt=end_date,
                end_date__gt=start_date).exists()
        else:
            overlapping = Rent.objects.filter(
                item=item,
                start_date__lte=end_date,
                end_date__gte=start_date).exists()

        if overlapping:
            return Response(
                {'error': 'El objeto no está disponible en esas fechas'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RentSerializer(data=request.data,
                                    context={'item_instance': item})

        if serializer.is_valid():
            serializer.save(renter=user, item=item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def respond_request(self, request, pk=None):
        rent_id = request.data.get('rent')
        rent = get_object_or_404(Rent, pk=rent_id)
        response = request.data.get("response")

        # is_owner = user == rent.item.user
        # is_authorized(condition=is_owner, authenticated=authenticated)

        if response == "accepted":
            rent.rent_status = RentStatus.ACCEPTED
            rent.save()
            return Response({'status': 'Solicitud aceptada. '
                            'El vendedor ha aceptado su solicitud.'})
        elif response == "rejected":
            rent.rent_status = RentStatus.CANCELLED
            rent.save()
            return Response({'status': 'Solicitud rechazada. '
                            'El alquiler se ha cancelado.'})
        else:
            raise PermissionDenied({'error': 'No existe un response adecuado'})

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
            raise PermissionDenied({"error": "El alquiler está cancelado y "
                                    "no se puede modificar."})

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
        is_authorized(condition=permission, authenticated=authenticated)

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
        rental_requests = Rent.objects.filter(item__user=user_id,
                                              rent_status=RentStatus.REQUESTED)
        serializer = RentSerializer(rental_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        user_id = request.query_params.get("user")
        my_requests = Rent.objects.filter(
            Q(renter=user_id) & (Q(rent_status=RentStatus.ACCEPTED) |
                                 Q(rent_status=RentStatus.REQUESTED))
            )
        serializer = RentSerializer(my_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)