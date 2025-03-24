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
