from django.shortcuts import render
from .models import Ticket, User
from rest_framework import status, filters
from rest_framework.response import Response

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
        # Se muestran los tickets en los que el usuario es:
        # - Quien reporta la incidencia (reporter)
        # - Quien la gestiona (manager)
        # - O el propietario del objeto (a través de la renta)
        return Ticket.objects.filter(
            Q(reporter=user) |
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
        data['user'] = request.user.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        ticket = serializer.save()
        return Response(
            serializer.data, status=status.HTTP_201_CREATED)