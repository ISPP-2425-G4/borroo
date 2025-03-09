from django.db import models


class ItemCategory(models.TextChoices):
    TECHNOLOGY = ('technology', 'Tecnología')
    SPORTS = ('sports', 'Deporte')
    DIY = ('diy', 'Bricolaje')
    CLOTHING = ('clothing', 'Ropa')
    FURNITURE_AND_LOGISTICS = ('furniture_and_logistics',
                               'Mobiliario y logística')
    TRAINING = ('training', 'Entrenamiento')


class CancelType(models.TextChoices):
    FLEXIBLE = ('flexible', 'Flexible')
    MEDIUM = ('medium', 'Medio')
    STRICT = ('strict', 'Estricto')


class PriceCategory(models.TextChoices):
    HOUR = ('hour', 'Hora')
    DAY = ('day', 'Día')
    WEEK = ('week', 'Semana')
    MONTH = ('month', 'Mes')
    YEAR = ('year', 'Año')


class Item(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=ItemCategory.choices
    )
    cancel_type = models.CharField(
        max_length=10,
        choices=CancelType.choices
    )
    price_category = models.CharField(
        max_length=10,
        choices=PriceCategory.choices
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.title
