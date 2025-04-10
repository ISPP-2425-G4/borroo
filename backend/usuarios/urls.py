from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CreateItemView, CreateUserView, UserListView
from .views import ListItemsView, RentListView, UpdateUserPerfilView
from .views import PasswordResetRequestView, PasswordResetConfirmView
from .views import ReviewCreateView, ReviewDeleteView, ReviewListView
from .views import DeleteUserView, GetUserView, UpdateItemView
from .views import DeleteItemView, DeleteRentView, UpdateRentView
from .views import check_username, check_email, UserProfileView, UserViewSet
from .views import CreateSuperuserView, UpdateUserView, VerifyEmailView
from .views import ReportViewSet

from . import views

app_name = "app"

# Configura el router
router = DefaultRouter()
router.register(r'full', UserViewSet, basename='user')
router.register(r'reportes', ReportViewSet, )

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
    path("verifyEmail/<str:token>/",
         VerifyEmailView.as_view(), name="verify_email"),
    path("perfil/", UserProfileView.as_view(), name="user-profile"),
    path("reviews/create/", ReviewCreateView.as_view(), name="review-create"),
    path("reviews/", ReviewListView.as_view(), name="review-list"),
    path("reviews/delete/", ReviewDeleteView.as_view(), name="review-delete"),
    path('create-superuser/', CreateSuperuserView.as_view(),
         name='create_superuser'),
    path("adminCustome/users/", UserListView.as_view(), name="list_users"),
    path("adminCustome/users/create/", CreateUserView.as_view(),
         name="create_user"),
    path("adminCustome/users/<int:user_id>/", GetUserView.as_view(),
         name="get_user"),
    path("adminCustome/users/update/<int:user_id>/", UpdateUserView.as_view(),
         name="update_user"),
    path("adminCustome/users/delete/<int:user_id>/", DeleteUserView.as_view(),
         name="delete_user"),
    path('adminCustome/item/create/', CreateItemView.as_view(),
         name='create-item'),
    path('adminCustome/item/<int:item_id>/update/',
         UpdateItemView.as_view(), name='update-item'),
    path('adminCustome/item/<int:item_id>/delete/', DeleteItemView.as_view(),
         name='delete-item'),
    path('adminCustome/rent/<int:rent_id>/update/', UpdateRentView.as_view(),
         name='update-rent'),
    path('adminCustome/rent/<int:rent_id>/delete/', DeleteRentView.as_view(),
         name='delete-rent'),
    path('adminCustome/items/', ListItemsView.as_view(), name='list-items'),
    path('adminCustome/rent/list/', RentListView.as_view(), name='rent-list'),
    path('update/', UpdateUserPerfilView.as_view(), name='update-user'),
    path('update-image/', UpdateUserPerfilView.as_view(),
         name='update-user-image'),


]
