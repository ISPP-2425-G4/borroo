from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

from . import views  

app_name = "app"

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path("", views.index, name="index"),
    path('', include(router.urls)),
    path("api/message/", views.get_message, name="get_message"),  
]
