import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rentas.models import Rent, PaymentStatus
from usuarios.models import User
import json

stripe.api_key = settings.STRIPE_SECRET_KEY


@csrf_exempt
def create_checkout_session(request, rent_id):
    if request.method == 'POST':
        try:
            rent = Rent.objects.get(id=rent_id)
            total_price = int(rent.total_price * 100)
            currency = 'eur'

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency,
                        'product_data': {
                            'name': f'Alquiler de {rent.item.title}',
                        },
                        'unit_amount': total_price,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url="http://localhost:5173/",
                cancel_url="http://localhost:5173/",
                metadata={
                    'rent_id': rent_id,
                }
            )

            return JsonResponse({'id': session.id})

        except Rent.DoesNotExist:
            return JsonResponse({'error': 'Alquiler no encontrado'},
                                status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
def confirmar_pago(request, session_id):
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == 'paid':
            metadata = session.metadata
            rent_id = metadata.get('rent_id')

            if rent_id:
                try:
                    rent = Rent.objects.get(id=rent_id)
                    rent.payment_status = PaymentStatus.PAID
                    rent.save()

                    return JsonResponse({
                        'status': 'success',
                        'rent_id': rent.id
                    })
                except Rent.DoesNotExist:
                    return JsonResponse({'error': 'Rent no encontrado'},
                                        status=404)
            else:
                return JsonResponse({
                    'error': 'rent_id no encontrado en metadatos'}, status=400)
        else:
            return JsonResponse({'status': 'unpaid'}, status=402)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt
def create_subscription_checkout(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user = User.objects.get(id=data.get('user_id'))
            currency = data.get('currency', 'EUR')
            amount = data.get('price')*100

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency,
                        'product_data': {
                            'name': 'Subscripcion mensual',
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url="http://localhost:5173/pricing-plan?session_id={CHECKOUT_SESSION_ID}",
                cancel_url="http://localhost:5173/pricing-plan",
                metadata={
                    'user_id': user.id
                }
            )
            return JsonResponse({'id': session.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
def confirm_subscription_checkout(request, session_id):
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == 'paid':
            metadata = session.metadata
            print("metadata",metadata)
            user_id = metadata.get('user_id')

            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    user.pricing_plan = "premium"
                    user.stripe_customer_id = session.customer
                    user.stripe_subscription_id = session.subscription
                    user.save()

                    return JsonResponse({
                        'status': 'success',
                        'user_id': user.id,
                        'plan': user.pricing_plan
                    })
                except User.DoesNotExist:
                    return JsonResponse({'error': 'Usuario no encontrado'},
                                        status=404)
            else:
                return JsonResponse({
                    'error': 'user_id no encontrado en metadatos'}, status=400)
        else:
            return JsonResponse({'status': 'unpaid'}, status=402)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

