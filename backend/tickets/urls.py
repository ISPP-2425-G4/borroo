from django.urls import path, include
from .views import TicketDetailView, TicketViewSet, TicketImageView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'full', TicketViewSet, basename='incidencias')

urlpatterns = [
    path(
        'tickets/<int:id>/',
        TicketDetailView.as_view(),
        name='ticket-detail',
    ),
    path('', include(router.urls)),
    path('nueva/<int:rentId>/', TicketViewSet.as_view({'post': 'create'}),
         name='new_ticket'),
    path('item-images/<int:pk>/', TicketImageView.as_view(),
         name='ticket-image'),
    path('', include(router.urls)),
]
