from django.urls import path

from .views import create_checkout_session, confirmar_pago

urlpatterns = [
    path('checkout-session/<int:rent_id>/', create_checkout_session, name='create_checkout_session'),
    path('confirmar-pago/<str:session_id>/', confirmar_pago, name='confirmar_pago')
]
