from django.urls import path

from .views import (
     create_rent_checkout,
     confirm_rent_checkout,
     pay_with_balance,
     create_subscription_checkout,
     confirm_subscription_checkout,
     set_renter_confirmation,
     process_pending_confirmations,
     pay_subscrition_with_balance,
     withdraw_saldo
)

urlpatterns = [
     path('create-rent-checkout/', create_rent_checkout,
          name='create_checkout_session'),
     path('confirm-rent/<str:session_id>/', confirm_rent_checkout,
          name='confirmar_pago'),
     path('pay-with-balance/', pay_with_balance,
          name='pay_with_balance'),
     path('create-subscription-checkout/',
          create_subscription_checkout,
          name='create_subscription_checkout',
          ),
     path('confirm-subscription/<str:session_id>/',
          confirm_subscription_checkout,
          name='confirm_subscription_checkout',
          ),
     path(
         'set-renter-confirmation/',
         set_renter_confirmation,
         name='set_renter_confirmation',
     ),
     path(
         'process-pending-confirmations/',
         process_pending_confirmations,
         name='process_pending_confirmations',
     ),
     path(
        'pay_with_saldo/<int:user_id>/',
        pay_subscrition_with_balance,
        name='pay_with_saldo'
     ),
     path(
        'withdraw_saldo/<int:user_id>/',
        withdraw_saldo,
        name='withdraw_saldo'
     ),

]
