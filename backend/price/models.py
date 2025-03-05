from django.db import models

from item.models import Item


class PriceCategory(models.TextChoices):
    SHORT = 'SHORT', 'Short'
    MEDIUM = 'MEDIUM', 'Medium'
    LONG = 'LONG', 'Long'


class Price(models.Model):
    item = models.OneToOneField(Item, on_delete=models.CASCADE, 
                                related_name="price")
    price_category = models.CharField(max_length=10,
                                      choices=PriceCategory.choices)
    price1 = models.FloatField()
    price2 = models.FloatField()
    price3 = models.FloatField()

    def __str__(self):
        return self.price1
