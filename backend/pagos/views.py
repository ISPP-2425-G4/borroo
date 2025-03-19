import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views import View
from rentas.models import Rent

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(View):
    def post(self, request, *args, **kwargs):
        rent_id = request.data.get('rent_id')
        rent = Rent.objects.get(id=rent_id)

        # Crear la sesión de Stripe
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': f"Alquiler de {rent.item.title}",
                        },
                        'unit_amount': int(rent.total_price * 100),
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=request.build_absolute_uri('/success/'),
            cancel_url=request.build_absolute_uri('/cancel/'),
        )

        return JsonResponse({
            'id': session.id
        })
