from django.db import models


class ItemCategory(models.TextChoices):
    SPORTS_EQUIPMENT = 'sports_equipment', 'Material deportivo'
    ELECTRONICS = 'electronics', 'Electrónica'
    DIY = 'diy', 'Bricolaje'


class CancelType(models.TextChoices):
    FLEXIBLE = 'flexible', 'Flexible'
    MEDIUM = 'medium', 'Medium'
    STRICT = 'strict', 'Strict'


class PriceCategory(models.TextChoices):
    SHORT = 'short', 'Short'
    MEDIUM = 'medium', 'Medium'
    LONG = 'long', 'Long'


class Item(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=ItemCategory.choices
    )
    cancel_type = models.CharField(
        max_length=10,
        choices=CancelType.choices
    )

    def __str__(self):
        return self.title


class Price(models.Model):
    id = models.AutoField(primary_key=True)
    item = models.OneToOneField(Item, on_delete=models.CASCADE)
    price_category = models.CharField(
        max_length=10,
        choices=PriceCategory.choices
    )
    price1 = models.DecimalField(max_digits=10, decimal_places=2)
    price2 = models.DecimalField(max_digits=10, decimal_places=2)
    price3 = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.item.title} - {self.price_category}"
