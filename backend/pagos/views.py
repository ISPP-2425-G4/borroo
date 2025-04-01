from decimal import Decimal
import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rentas.models import Rent, PaymentStatus
from usuarios.models import User
import json

stripe.api_key = settings.STRIPE_SECRET_KEY


@csrf_exempt
def create_rent_checkout(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = User.objects.get(id=data.get('user_id'))
            rent = Rent.objects.get(id=data.get('rent_id'))
            currency = data.get('currency', 'EUR')
            amount = data.get('price')

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency,
                        'product_data': {
                            'name': 'Alquiler de producto',
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=(
                    "http://localhost:5173/rental_requests?"
                    "session_id={CHECKOUT_SESSION_ID}"
                ),
                cancel_url="http://localhost:5173/rental_requests",
                metadata={
                    'user_id': user.id,
                    'rent_id': rent.id
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
def confirm_rent_checkout(request, session_id):
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == 'paid':
            metadata = session.metadata
            rent_id = metadata.get('rent_id')
            user_id = metadata.get('user_id')

            if rent_id and user_id:
                try:
                    renta = Rent.objects.get(id=rent_id)
                    owner = renta.item.user  # Obtener el propietario del item
                    total_price = Decimal(str(renta.total_price))
                    commission = Decimal(str(renta.commission))

                    # Actualizar saldo del owner
                    owner.saldo += (total_price - commission)
                    owner.save()

                    # Marcar la renta como pagada
                    renta.payment_status = PaymentStatus.PAID
                    renta.save()

                    return JsonResponse({
                        'status': 'success',
                        'rent_id': renta.id,
                        'user_id': user_id
                    })
                except Rent.DoesNotExist:
                    return JsonResponse({'error': 'Alquiler no encontrado'},
                                        status=404)
                except User.DoesNotExist:
                    return JsonResponse({'error': 'Usuario no encontrado'},
                                        status=404)
                except Exception as e:
                    return JsonResponse({
                        'error': f'Error al actualizar saldos: {str(e)}'},
                                        status=400)
            else:
                return JsonResponse({
                    'error': 'rent_id o user_id no encontrado en metadatos'},
                                    status=400)
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
                success_url=(
                    (
                        "http://localhost:5173/pricing-plan?"
                        "session_id={CHECKOUT_SESSION_ID}"
                    )
                ),
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
            print("metadata", metadata)
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
