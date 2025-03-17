from django.urls import path
from .views import checkout, create_checkout_session

urlpatterns = [
    path("checkout/", checkout, name="checkout"),
    path("create-checkout-session/", create_checkout_session, name="create_checkout_session"),
]
