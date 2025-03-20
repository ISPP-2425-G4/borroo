import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rentas.models import Rent, PaymentStatus

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
            return JsonResponse({'error': 'Alquiler no encontrado'}, status=404)
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
                    return JsonResponse({'error': 'Rent no encontrado'}, status=404)
            else:
                return JsonResponse({'error': 'rent_id no encontrado en metadatos'}, status=400)
        else:
            return JsonResponse({'status': 'unpaid'}, status=402)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)