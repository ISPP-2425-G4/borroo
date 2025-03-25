from django.urls import path

from .views import create_checkout_session, confirmar_pago, create_subscription_checkout, confirm_subscription_checkout

urlpatterns = [
    path('checkout-session/<int:rent_id>/', create_checkout_session,
         name='create_checkout_session'),
    path('confirmar-pago/<str:session_id>/', confirmar_pago,
         name='confirmar_pago'),
     path('create-subscription-checkout/', create_subscription_checkout),
     path('confirm-subscription/<str:session_id>/', confirm_subscription_checkout)
]
