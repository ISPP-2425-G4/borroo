from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status, filters
from .models import Rent, RentStatus, Item
from .serializers import RentSerializer
from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.exceptions import NotFound
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import get_object_or_404


def is_authorized(condition=True, authenticated=True):
    if not authenticated:
        raise NotAuthenticated(
            {'error': 'Debes estar autenticado.'})
    elif not condition:
        raise PermissionDenied(
            {'error': 'No tienes permisos para realizar esta acción.'})


class RentViewSet(viewsets.ModelViewSet):
    queryset = Rent.objects.all()
    serializer_class = RentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['payment_status']
    ordering_fields = ['total_price', 'start_date']
    ordering = ['-start_date']

    def get_queryset(self):
        user = self.request.user if not AnonymousUser else None
        authenticated = self.request.user.is_authenticated
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
        # el frontend pasa la informacion necesaria en el body
        item_id = request.data.get('item')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        user = self.request.user if not AnonymousUser else None
        # De momento se puede autenticar
        # authenticated = self.request.user.is_authenticated

        item = get_object_or_404(Item, pk=item_id)

        not_rent_yourself = user != item.user

        is_authorized(condition=not_rent_yourself)

        if Rent.objects.filter(item=item, start_date__lte=end_date,
                               # por dentro django usa la pk de item
                               # para el filtro
                               end_date__gte=start_date).exists():
            return Response(
                {'error': 'El objeto no está disponible en esas fechas'},
                status=status.HTTP_400_BAD_REQUEST)

        serializer = RentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(renter=user, item=item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def respond_request(self, request, pk=None):
        rent = self.get_object()
        response = request.data.get("response")

        user = self.request.user if not AnonymousUser else None
        authenticated = self.request.user.is_authenticated
        is_owner = user == rent.item.user

        is_authorized(condition=is_owner, authenticated=authenticated)
        if response == "accepted":
            rent.rent_status = RentStatus.BOOKED
            rent.save()
            return Response({'status': 'Solicitud aceptada. '
                            'El objeto ha sido reservado.'})
        elif response == "rejected":
            rent.rent_status = RentStatus.CANCELLED
            rent.save()
            return Response({'status': 'Solicitud rechazada. '
                            'El alquiler se ha cancelado.'})
        else:
            return Response({'error': 'No existe un response adecuado'})

    @action(detail=True, methods=['put'])
    def cancel_rent(self, request, pk=None):
        user = request.user if not AnonymousUser else None
        rent = self.get_object()
        renter = rent.renter
        authenticated = request.user.is_authenticated
        permission = renter == user
        is_authorized(condition=permission, authenticated=authenticated)

        if rent.rent_status in [RentStatus.BOOKED, RentStatus.REQUESTED]:
            rent.rent_status = RentStatus.CANCELLED
            rent.save()
            return Response({'status': 'Alquiler cancelado exitosamente'})
        return Response(
            {'error': 'No se puede cancelar un alquiler en este estado'},
            status=400
        )

    def destroy(self, request, *args, **kwargs):
        rent = self.get_object()
        renter = rent.renter
        user = request.user if not AnonymousUser else None
        authenticated = request.user.is_authenticated
        permission = renter == user
        is_authorized(condition=permission, authenticated=authenticated)
        return super().destroy(request, *args, **kwargs)

    def get_all_rent_request(self, request):
        user = request.user if not AnonymousUser else None
        authenticated = request.user.is_authenticated
        owner = request.data.get('user')
        permission = user == owner
        is_authorized(condition=permission, authenticated=authenticated)
        all_rent_requests = Rent.objects.filter(item__user=owner and
                                                RentStatus.REQUESTED)
        return Response(all_rent_requests, status=status.HTTP_200_OK)
