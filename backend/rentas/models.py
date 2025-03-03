from django.db import models
from usuarios.models import User  # Importamos el modelo User
from items.models import Item  # Importamos el modelo Item

class RentStatus(models.TextChoices):
    REQUESTED = "requested", "Requested"
    BOOKED = "booked", "Booked"
    PICKED_UP = "picked_up", "Picked Up"
    RETURNED = "returned", "Returned"
    RATED = "rated", "Rated"
    CANCELLED = "cancelled", "Cancelled"

class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PROCESSING = "processing", "Processing"
    CANCELLED = "cancelled", "Cancelled"
    PAID = "paid", "Paid"

class Rent(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="rents")  # Relación con el Item alquilado
    renter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rents")  # Usuario que alquila
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    rent_status = models.CharField(
        max_length=20,
        choices=RentStatus.choices,
        default=RentStatus.REQUESTED
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    commission = models.FloatField()
    total_price = models.FloatField()

    def __str__(self):
        return f"{self.renter.username} alquiló {self.item.title} de {self.start_date} a {self.end_date}"
