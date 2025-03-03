from rest_framework import viewsets
from .models import Rent
from .serializers import RentSerializer

class RentViewSet(viewsets.ModelViewSet):
    queryset = Rent.objects.all()
    serializer_class = RentSerializer
