from django.db import models
from django.core.validators import EmailValidator, RegexValidator

text_validator = RegexValidator(
    regex=r'^[A-Za-zÁÉÍÓÚáéíóúÑñ].*',
    message="Este campo debe comenzar con una letra."
)


class PricingPlan(models.TextChoices):
    FREE = ('free', 'Gratis')
    PREMIUM = ('premium', 'Premium')


class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, validators=[text_validator])
    surname = models.CharField(max_length=255, validators=[text_validator])
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255, validators=[
            RegexValidator(
                regex=r'^(?=.*[A-Z])',  # Al menos una mayúscula
                message='La contraseña debe contener '
                'al menos una letra mayúscula.'
            ),
            RegexValidator(
                regex=r'^(?=.*\d)',  # Al menos un número
                message='La contraseña debe contener al menos un número.'
            ),
            RegexValidator(
                regex=r'^(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?])',
                message='La contraseña debe contener '
                'al menos un carácter especial.'
            ),
            RegexValidator(
                regex=r'^.{8,}$',  # Al menos 8 caracteres
                message='La contraseña debe tener al menos 8 caracteres.'
            ),
        ],
        help_text='La contraseña debe tener al menos 8 caracteres,'
        'una mayúscula, un número y un carácter especial.')
    email = models.CharField(max_length=255, unique=True,
                             validators=[
                                 EmailValidator(
                                    message="Introduce un email válido.")])
    phone_number = models.CharField(max_length=25, validators=[
            RegexValidator(
                regex=r'^\+?[0-9]{7,15}$',
                message="Introduce un número de teléfono válido."
            )
        ])
    country = models.CharField(max_length=255, validators=[text_validator])
    city = models.CharField(max_length=255, validators=[text_validator])
    address = models.TextField(max_length=75, validators=[text_validator])
    postal_code = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex='^[0-9]{5}(-[0-9]{4})?$',
                message='El codigo postal debe tener el \
                    formato 12345 o 12345-6789.'
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
