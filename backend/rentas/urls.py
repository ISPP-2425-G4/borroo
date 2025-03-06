from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RentViewSet

router = DefaultRouter()
router.register(r'rentas', RentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
