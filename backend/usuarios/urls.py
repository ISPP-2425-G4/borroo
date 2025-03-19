from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, check_username, check_email
from .views import PasswordResetRequestView, PasswordResetConfirmView


from . import views

app_name = "app"

# Configura el router
router = DefaultRouter()
router.register(r'full', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path("api/message/", views.get_message, name="get_message"),
    path('login/', UserViewSet.as_view({'post': 'login'}), name='login'),
    path('check_username/', check_username,
         name='check_username'),
    path('check_email/', check_email, name='check_email'),
    path("password_reset/", PasswordResetRequestView.as_view(),
         name="password_reset"),
    path("password_reset_confirm/<str:token>/",
         PasswordResetConfirmView.as_view(), name="password_reset_confirm"),

]
