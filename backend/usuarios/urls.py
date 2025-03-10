from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet


from . import views

app_name = "app"

router = DefaultRouter()
router.register(r'full', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path("api/message/", views.get_message, name="get_message"),
    path('login/', UserViewSet.as_view({'post': 'login'}), name='login'),

]
