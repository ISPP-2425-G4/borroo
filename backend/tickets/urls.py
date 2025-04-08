from django.urls import path, include
from .views import TicketViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'full', TicketViewSet, basename='rentas')

urlpatterns = [
    path('incidencias/nueva/<int:rent_id>/',
         TicketViewSet.as_view({'post': 'create'})),
    path('', include(router.urls)),
]
