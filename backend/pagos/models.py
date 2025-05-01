from django.db import models
from rentas.models import Rent


class Payment(models.Model):
    rent = models.OneToOneField(Rent, on_delete=models.CASCADE,
                                related_name='payment')
    stripe_session_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, default='pending')

    def __str__(self):
        return f"Pago para alquiler {self.rent.id} - {self.payment_status}"


class PaidPendingConfirmation(models.Model):
    rent = models.OneToOneField(
        Rent,
        on_delete=models.CASCADE,
        related_name="paid_pending_confirmation"
    )
    is_confirmed_by_owner = models.BooleanField(
        null=True,
        help_text="Indica si el propietario ha confirmado el pago."
    )
    is_confirmed_by_renter = models.BooleanField(
        null=True,
        help_text="Indica si el arrendatario ha confirmado el pago."
    )

    def __str__(self):
        return (
            f"PaidPendingConfirmation for Rent ID {self.rent.id} - "
            f"Owner Confirmed: {self.is_confirmed_by_owner}, "
            f"Renter Confirmed: {self.is_confirmed_by_renter}"
        )
