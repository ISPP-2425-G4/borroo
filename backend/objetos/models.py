from django.db import models

from django.core.validators import MinValueValidator
from django.core.validators import MaxValueValidator, DecimalValidator


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
    description = models.TextField(max_length=1000)
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
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[
            MinValueValidator(0.01, message="El precio debe ser mayor a 0."),
            MaxValueValidator(99999999.99,
                              message="El precio no puede ser \
                                  mayor a 99,999,999.99."),
            DecimalValidator(max_digits=10, decimal_places=2)
        ])
    user = models.ForeignKey('usuarios.User', related_name='items',
                             on_delete=models.CASCADE)
    draft_mode = models.BooleanField(default=False)
    dates_not_available = models.JSONField(default=list)

    


class ItemImage(models.Model):
    item = models.ForeignKey(Item, related_name='images',
                             on_delete=models.CASCADE)
    image = models.URLField()


class ItemRequest(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
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
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[
        MinValueValidator(0.01, message="El precio debe ser mayor a 0."),
        MaxValueValidator(99999999.99,
                          message="El precio no puede ser mayor"
                          " a 99,999,999.99."),
        DecimalValidator(max_digits=10, decimal_places=2)
    ])
    user = models.ForeignKey(
        'usuarios.User',
        related_name='item_requests',
        on_delete=models.CASCADE
        )
    created_at = models.DateTimeField(auto_now_add=True)
    approved = models.BooleanField(default=False)

    def approve(self):
        """Método para aprobar la solicitud y crear un Item"""
        item = Item.objects.create(
            title=self.title,
            description=self.description,
            category=self.category,
            cancel_type=self.cancel_type,
            price_category=self.price_category,
            price=self.price,
            user=self.user
        )
        self.approved = True
        self.save()
        return item
