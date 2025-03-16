from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RentViewSet

router = DefaultRouter()
router.register(r'full', RentViewSet, basename='rentas')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'all-requests/',
        RentViewSet.as_view({'get': 'all_requests'}),
        name='all-requests'
    ),
]
