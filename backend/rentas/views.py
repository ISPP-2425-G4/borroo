from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status, filters
from .models import Rent, RentStatus
from .serializers import RentSerializer


class RentViewSet(viewsets.ModelViewSet):
    queryset = Rent.objects.all()
    serializer_class = RentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['payment_status']
    ordering_fields = ['total_price', 'start_date']
    ordering = ['-start_date']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Rent.objects.all()
        return Rent.objects.filter(renter=user)

    @action(detail=False, methods=['post'])
    def first_request(self, request, *args, **kwargs):
        item_id = request.data.get('item')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if Rent.objects.filter(item_id=item_id, start_date__lte=end_date,
                               end_date__gte=start_date).exists():
            return Response(
                {'error': 'El objeto no está disponible en esas fechas'},
                status=status.HTTP_400_BAD_REQUEST)

        serializer = RentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(renter=request.user, item=item_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def respond_request(self, request, pk=None):
        rent = self.get_object()
        owner = rent.item.user
        renter = rent.renter

        response = request.data.get("response")
        # añadirla al body del json en el front como responseType
        # segun el boton que pulse

        if request.user == owner:
            if response == "accepted":
                rent.rent_status = RentStatus.BOOKED
                rent.save()
                return Response(
                    {
                        'status': (
                            'Solicitud aceptada. El objeto ha sido reservado.'
                        )
                    }
                )
            elif response == "rejected":
                rent.rent_status = RentStatus.CANCELLED
                rent.save()
                return Response(
                    {
                        'status': (
                            'Solicitud rechazada. El alquiler se ha cancelado.'
                        )
                    }
                )

            elif response == "picked_up":
                if rent.rent_status == RentStatus.BOOKED:
                    rent.rent_status = RentStatus.PICKED_UP
                    rent.save()
                    return Response(
                        {
                            'status':
                            'El objeto ha sido entregado al arrendatario.'
                        }
                    )
                return Response(
                    {
                        'error': (
                            'Solo puedes cambiar a "PICKED_UP" '
                            'si está en estado "BOOKED".'
                        )
                    }, status=400)
            else:
                return Response({'error': 'No puedes realizar esta acción.'},
                                status=400)

        elif request.user == renter:
            if response == "returned" and (
                rent.rent_status == RentStatus.PICKED_UP
            ):
                rent.rent_status = RentStatus.RETURNED
                rent.save()
                return Response(
                    {'status': 'El objeto ha sido devuelto correctamente.'})
            else:
                return Response({'error': 'No puedes realizar esta acción.'},
                                status=400)

        return Response(
            {'error': 'No tienes permiso para gestionar este alquiler.'},
            status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['put'])
    def cancel_rent(self, request, pk=None):
        rent = self.get_object()

        if rent.rent_status in [RentStatus.BOOKED, RentStatus.REQUESTED]:
            rent.rent_status = RentStatus.CANCELLED
            rent.save()
            return Response({'status': 'Alquiler cancelado exitosamente'})
        return Response(
            {'error': 'No se puede cancelar un alquiler en este estado'},
            status=400
        )
