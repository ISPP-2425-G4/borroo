from django.db import models
from django.core.validators import RegexValidator


class PricingPlan(models.TextChoices):
    FREE = 'free', 'Free'
    BASIC = 'basic', 'Basic'
    PREMIUM = 'premium', 'Premium'


class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    phone_number = models.CharField(max_length=25)
    country = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    address = models.TextField()
    postal_code = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex='^[0-9]{5}(-[0-9]{4})?$',
                message='Postal code must be in the \
                    format 12345 or 12345-6789.'
            )
        ]
    )
    is_verified = models.BooleanField(default=False)
    pricing_plan = models.CharField(
        max_length=10,
        choices=PricingPlan.choices,
        default=PricingPlan.FREE
    )
    # Atributo derivado que se necesita la entidad de reviews
    owner_rating = models.FloatField(default=0.0)
    # Atributo derivado que se necesita la entidad de reviews
    renter_rating = models.FloatField(default=0.0)

    def __str__(self):
        return self.username
