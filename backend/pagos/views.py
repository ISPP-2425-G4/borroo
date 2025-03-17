import stripe
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render

stripe.api_key = settings.STRIPE_SECRET_KEY

def checkout(request):
    return render(request, "checkout.html", {"stripe_public_key": settings.STRIPE_PUBLIC_KEY})

def create_checkout_session(request):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": "Realiar el pago",
                        },
                        "unit_amount": 1000,
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url="http://127.0.0.1:8000/success/",
            cancel_url="http://127.0.0.1:8000/cancel/",
        )
        return JsonResponse({"id": session.id})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
