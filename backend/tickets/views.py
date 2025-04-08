from .models import Ticket, TicketStatus
from .serializers import TicketSerializer
from rest_framework import status, filters, viewsets
from rest_framework.response import Response
from django.db.models import Q
from django.utils.timezone import now


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
        if not self.request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # Se muestran los tickets en los que el usuario es:
        # - Quien reporta la incidencia (reporter)
        # - Quien la gestiona (manager)
        # - O el propietario del objeto (a través de la renta)
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

        data = request.data.copy()
        # data['user'] = request.user.id

        serializer = self.get_serializer(data=data)
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
        # Verificamos que el usuario esté autenticado
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Recuperamos el objeto a eliminar
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

        # Eliminamos el objeto
        ticket.delete()

        return Response(
            {"detail": "Incidencia eliminada exitosamente."},
            status=status.HTTP_204_NO_CONTENT
        )
