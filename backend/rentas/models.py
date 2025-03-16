from decimal import Decimal
from django.db import models
from usuarios.models import User  # Importamos el modelo User
from objetos.models import Item, CancelType  # Importamos el modelo Item


class RentStatus(models.TextChoices):
    ACCEPTED = "accepted", "Accepted"
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
    item = models.ForeignKey(Item,
                             on_delete=models.SET_NULL,
                             related_name="rents",
                             null=True)  # Relación con el Item alquilado
    renter = models.ForeignKey(User,
                               on_delete=models.SET_NULL,
                               related_name="rents",
                               null=True)  # Usuario que alquila
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
    total_price = models.FloatField(default=0.0)
    commission = models.FloatField(default=0.0)

    def calculate_rental_duration(self):
        """Calcula la duración del alquiler según `item.price_category`."""
        if not self.item:
            return 0  # Si el Item es NULL, no puede calcular duración

        duration = self.end_date - self.start_date
        price_category = self.item.price_category  # Se obtiene desde Item

        if price_category == "hour":
            return duration.total_seconds() / 3600  # Horas
        elif price_category == "day":
            return duration.days  # Días completos
        elif price_category == "week":
            return duration.days / 7  # Semanas
        elif price_category == "month":
            return duration.days / 30  # Meses (aproximado)
        elif price_category == "year":
            return duration.days / 365  # Años (aproximado)
        return 0

    def calculate_base_price(self):
        """Calcula el precio base del alquiler."""
        rental_duration = self.calculate_rental_duration()
        rental_duration_decimal = Decimal(str(rental_duration))
        return rental_duration_decimal * self.item.price  # Precio base

    def calculate_total_price(self):
        """Calcula total_price como precio base + 7.5% de incremento."""
        base_price = self.calculate_base_price()
        additional_fee = base_price * Decimal("0.075")  # 7.5% adicional
        return round(base_price + additional_fee, 2)

    def calculate_commission(self):
        """Calcula commission como el 15% de base_price."""
        base_price = self.calculate_base_price()
        return round(base_price * Decimal("0.15"), 2)

    def save(self, *args, **kwargs):
        """Antes de guardar, calcula total_price y commission."""
        self.total_price = self.calculate_total_price()
        self.commission = self.calculate_commission()
        super().save(*args, **kwargs)

    def __str__(self):
        renter_name = self.renter.username if self.renter else 'User eliminado'
        item_title = self.item.title if self.item else 'Item eliminado'
        return f"{renter_name} {item_title} {self.start_date} {self.end_date}"
