from django.urls import path

from .views import (
     create_rent_checkout,
     confirm_rent_checkout,
     create_subscription_checkout,
     confirm_subscription_checkout,
)

urlpatterns = [
     path('create-rent-checkout', create_rent_checkout,
          name='create_checkout_session'),
     path('confirm-rent/<str:session_id>/', confirm_rent_checkout,
          name='confirmar_pago'),
     path('create-subscription-checkout/', create_subscription_checkout),
     path('confirm-subscription/<str:session_id>/',
          confirm_subscription_checkout)
]
