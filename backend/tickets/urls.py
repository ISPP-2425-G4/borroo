from django.urls import path, include
from .views import TicketViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'full', TicketViewSet, basename='incidencias')

urlpatterns = [
    path('nueva/<int:rentId>/', TicketViewSet.as_view({'post': 'create'}),
         name='new_ticket'),
    path('', include(router.urls)),
]
