from decimal import Decimal
import stripe
from datetime import timedelta
from django.utils.timezone import now
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework import serializers
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rentas.models import Rent, PaymentStatus
from usuarios.models import User
import json
import os
from pagos.models import PaidPendingConfirmation

SCHEDULER_TOKEN = os.getenv("SCHEDULER_TOKEN")
stripe.api_key = settings.STRIPE_SECRET_KEY
frontend_base_url = os.getenv("RECOVER_PASSWORD")


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
                    f"{frontend_base_url}rental_requests?"
                    "session_id={CHECKOUT_SESSION_ID}"
                ),
                cancel_url=f"{frontend_base_url}rental_requests",
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
@require_http_methods(["POST"])
def pay_with_balance(request):
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")
        rent_id = data.get("rent_id")
        price = Decimal(data.get("price")) / 100

        user = User.objects.get(id=user_id)
        rent = Rent.objects.get(id=rent_id)

        if user.saldo < price:
            return JsonResponse({
                "status": "error",
                "error": "Saldo insuficiente para realizar el pago."
            }, status=400)

        # Deducir el saldo del usuario
        user.saldo -= price
        user.save()

        # Marcar la renta como pagada
        rent.payment_status = PaymentStatus.PAID
        rent.save()

        # Crear un registro de PaidPendingConfirmation
        PaidPendingConfirmation.objects.create(
            rent=rent,
            is_confirmed_by_owner=None,
            is_confirmed_by_renter=None
        )

        return JsonResponse({
            "status": "success",
            "message": "Pago realizado con saldo exitosamente."
        })

    except User.DoesNotExist:
        return JsonResponse({"error": "Usuario no encontrado."}, status=404)
    except Rent.DoesNotExist:
        return JsonResponse({"error": "Renta no encontrada."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


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

                    # Crear un registro de PaidPendingConfirmation
                    PaidPendingConfirmation.objects.create(
                        rent=renta,
                        is_confirmed_by_owner=None,
                        is_confirmed_by_renter=None
                    )

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
                        f"{frontend_base_url}pricing-plan?"
                        "session_id={CHECKOUT_SESSION_ID}"
                    )
                ),
                cancel_url=f"{frontend_base_url}pricing-plan",
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


@require_http_methods(["POST"])
@api_view(['POST'])
def set_renter_confirmation(request):
    try:
        data = request.data
        rent_id = data.get('rent_id')
        user_id = data.get('user_id')

        # Obtener la renta
        rent = Rent.objects.get(id=rent_id)

        confirmation = (
            PaidPendingConfirmation.objects.filter(rent=rent).first()
        )

        if not confirmation:
            return Response(
                {
                    "error": (
                        "No se encontró un registro de "
                        "PaidPendingConfirmation para esta renta."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Verificar si el user_id corresponde al renter
        if user_id == rent.renter.id:
            # Establecer is_confirmed_by_renter a True
            confirmation.is_confirmed_by_renter = True
            confirmation.save()

            # Procesar la confirmación del pago
            process_payment_confirmation(confirmation)

            return Response(
                {
                    "status": "success",
                    "message": (
                        "Confirmación registrada correctamente por el "
                        "arrendatario."
                    )
                },
                status=status.HTTP_200_OK
            )

        # Verificar si el user_id corresponde al propietario del ítem
        elif user_id == rent.item.user.id:
            # Establecer is_confirmed_by_owner a True
            confirmation.is_confirmed_by_owner = True
            confirmation.save()

            return Response(
                {
                    "status": "success",
                    "message": (
                        "Confirmación registrada correctamente por el "
                        "propietario."
                    )
                },
                status=status.HTTP_200_OK
            )

        # Si el user_id no coincide con ninguno, lanzar una excepción
        else:
            return Response(
                {
                    "error": (
                        "El usuario no tiene permisos para confirmar esta "
                        "renta."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

    except Rent.DoesNotExist:
        return Response(
            {"error": "Renta no encontrada."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@require_http_methods(["POST"])
@api_view(['POST'])
def process_pending_confirmations(request):
    """
    Procesa todas las rentas con estatus pagado y cuya confirmación por parte
    del arrendatario sea nula, y hayan pasado más de dos días desde su fin.
    """
    try:
        # Verificar el token
        token = request.data.get('token')
        if token != SCHEDULER_TOKEN:
            return Response(
                {"error": "Token inválido."},
                status=status.HTTP_403_FORBIDDEN
            )
        # Obtener la fecha límite (hace 2 días desde hoy)
        two_days_ago = now() - timedelta(days=2)

        # Filtrar las rentas con las condiciones especificadas
        rents = Rent.objects.filter(
            payment_status=PaymentStatus.PAID,
            paid_pending_confirmation__is_confirmed_by_renter=None,
            end_date__lte=two_days_ago
        )

        # Procesar cada renta
        for rent in rents:
            confirmation = rent.paid_pending_confirmation
            if confirmation:
                # Marcar is_confirmed_by_renter como True automáticamente
                confirmation.is_confirmed_by_renter = True
                confirmation.save()

                # Llamar a la función process_payment_confirmation
                process_payment_confirmation(confirmation)

        return Response(
            {
                "status": "success",
                "message": f"Se procesaron {rents.count()} rentas pendientes."
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def process_payment_confirmation(confirmation):
    """
    Procesa la confirmación del pago actualizando el saldo del propietario.
    """
    # Validar que is_confirmed_by_renter sea True
    if not confirmation.is_confirmed_by_renter:
        raise serializers.ValidationError(
            "El pago no puede ser confirmado porque el arrendatario no lo ha "
            "confirmado."
        )

    # Obtener el propietario del ítem a través de la trazabilidad
    renta = confirmation.rent
    owner = renta.item.user  # Obtener el propietario del ítem
    total_price = Decimal(str(renta.total_price))
    commission = Decimal(str(renta.commission))

    # Actualizar saldo del propietario
    owner.saldo += (total_price - commission)
    owner.save()

    return {
        "status": "success",
        "message": (
            f"El saldo del propietario {owner.username} "
            "ha sido actualizado."
        ),
        "new_balance": owner.saldo,
    }
