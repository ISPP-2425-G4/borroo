from .models import Ticket, TicketStatus
from .serializers import TicketSerializer
from rest_framework import status, filters, viewsets
from rest_framework.response import Response
from django.db.models import Q
from django.utils.timezone import now
from rest_framework.views import APIView
from .models import TicketImage


# Create your views here.
class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'status']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user

        # Si el usuario no está autenticado, devuelve un queryset vacío
        if not user.is_authenticated:
            return Ticket.objects.none()

        # Si el usuario es administrador, devuelve todos los tickets
        if user.is_admin:
            return Ticket.objects.all()

        # Si el usuario no es administrador, aplica los filtros
        return Ticket.objects.filter(
            Q(reporter=user) |  # OR
            Q(manager=user) |
            Q(rent__item__user=user)
        ).distinct()

    def create(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        rent_id = self.kwargs.get('rentId')
        if not rent_id:
            return Response({'error': 'No se proporcionó rentId en la URL.'},
                            status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['rent'] = rent_id
        # data['user'] = request.user.id

        serializer = self.get_serializer(
            data=data, context={'request': request, 'rentId': rent_id}
            )
        serializer.is_valid(raise_exception=True)

        serializer.save()
        return Response(
            serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        if not request.user.is_authenticated and not request.user.is_admin:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        instance = self.get_object()
        data = request.data.copy()

        if data.get("status") in [TicketStatus.RESOLVED,
                                  TicketStatus.CANCELLED]:
            data["closed_at"] = now()
        else:
            allowed_fields = ['description']
            data = {key: value for key, value in data.items()
                    if key in allowed_fields}

        serializer = self.get_serializer(
            instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            ticket = self.get_object()
        except Ticket.DoesNotExist:
            return Response({"detail": "Incidencia no encontrada."},
                            status=status.HTTP_404_NOT_FOUND)

        if not request.user.is_admin:
            return Response(
                {"detail": "No tienes permiso para eliminar esta incidencia."},
                status=status.HTTP_403_FORBIDDEN
            )
        ticket.delete()

        return Response(
            {"detail": "Incidencia eliminada exitosamente."},
            status=status.HTTP_204_NO_CONTENT
        )


class TicketImageView(APIView):
    def get(self, request, pk, format=None):
        try:
            ticket_image = TicketImage.objects.get(pk=pk)
            return Response({"image": ticket_image.image},
                            status=status.HTTP_200_OK)
        except TicketImage.DoesNotExist:
            return Response({"error": "Imagen no encontrada"},
                            status=status.HTTP_404_NOT_FOUND)
