from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewCreateView, ReviewDeleteView, ReviewListView
from .views import PasswordResetRequestView, PasswordResetConfirmView
from .views import check_username, check_email, UserProfileView, UserViewSet


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
    path("perfil/", UserProfileView.as_view(), name="user-profile"),
    path("reviews/create/", ReviewCreateView.as_view(), name="review-create"),
    path("reviews/", ReviewListView.as_view(), name="review-list"),
    path("reviews/delete/", ReviewDeleteView.as_view(), name="review-delete"),
]
