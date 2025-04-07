from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser

text_validator = RegexValidator(
    regex=r'^[A-Za-zÁÉÍÓÚáéíóúÑñ].*',
    message="Este campo debe comenzar con una letra."
)

cif_validator = RegexValidator(
    regex=r'^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$',
    message="CIF erroneo. Debe ser una letra, 7 numeros y un dígito/letra."
)


class PricingPlan(models.TextChoices):
    FREE = ('free', 'Gratis')
    PREMIUM = ('premium', 'Premium')


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, validators=[text_validator])
    surname = models.CharField(max_length=255, validators=[text_validator])
    username = models.CharField(max_length=255, unique=True)
    saldo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    password = models.CharField(max_length=255, validators=[
            RegexValidator(
                regex=r'^(?=.*[A-Z])',  # Al menos una mayúscula
                message='La contraseña debe contener al menos 8 caracteres,'
                'una mayúscula, un número y un carácter especial.'
            ),
            RegexValidator(
                regex=r'^(?=.*\d)',  # Al menos un número
                message='La contraseña debe contener al menos 8 caracteres,'
                'una mayúscula, un número y un carácter especial.'
            ),
            RegexValidator(
                regex=r'^(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?])',
                message='La contraseña debe contener al menos 8 caracteres,'
                'una mayúscula, un número y un carácter especial.'
            ),
            RegexValidator(
                regex=r'^.{8,}$',  # Al menos 8 caracteres
                message='La contraseña debe contener al menos 8 caracteres,'
                'una mayúscula, un número y un carácter especial.'
            ),
        ],
        help_text='La contraseña debe contener al menos 8 caracteres,'
        'una mayúscula, un número y un carácter especial.')
    email = models.CharField(max_length=255, unique=True,
                             validators=[
                                 EmailValidator(
                                    message="Introduce un email válido.")])
    phone_number = models.CharField(max_length=25, null=True, blank=True,
                                    validators=[RegexValidator(
                                                regex=r'^\+?[0-9]{7,15}$',
                                                message="Introduce un número"
                                                "de teléfono válido."
                                                )
                                                ])
    country = models.CharField(max_length=255, null=True, blank=True,
                               validators=[text_validator])
    city = models.CharField(max_length=255, null=True, blank=True,
                            validators=[text_validator])
    address = models.TextField(max_length=75, null=True, blank=True,
                               validators=[text_validator])
    postal_code = models.CharField(
        max_length=20, null=True, blank=True,
        validators=[
            RegexValidator(
                regex='^[0-9]{5}(-[0-9]{4})?$',
                message='El codigo postal debe tener el \
                    formato 12345 o 12345-6789.'
            )
        ]
    )
    cif = models.CharField(
        max_length=20,
        blank=False,
        null=True,
        validators=[cif_validator]
    )
    dni = models.CharField(
        max_length=9,
        unique=True,
        null=True, blank=True,
        validators=[RegexValidator(
            regex=r'^\d{8}[A-Z]$',  # 8 dígitos seguidos de una letra mayúscula
            message="El DNI debe tener el formato: 12345678A"
        )]
    )
    is_verified = models.BooleanField(default=False)
    verified_account = models.BooleanField(default=False)
    pricing_plan = models.CharField(
        max_length=10,
        choices=PricingPlan.choices,
        default=PricingPlan.FREE
    )
    # Atributo derivado que se necesita la entidad de reviews
    owner_rating = models.FloatField(default=0.0)
    # Atributo derivado que se necesita la entidad de reviews
    renter_rating = models.FloatField(default=0.0)
    reset_token = models.CharField(max_length=255, blank=True, null=True)
    reset_token_expiration = models.DateTimeField(blank=True, null=True)
    verify_token = models.CharField(max_length=255, blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    stripe_customer_id = models.CharField(max_length=255,
                                          null=True, blank=True)
    stripe_subscription_id = models.CharField(max_length=255,
                                              null=True, blank=True)

    REQUIRED_FIELDS = []
    USERNAME_FIELD = 'username'

    def is_reset_token_valid(self):
        """Verifica si el token sigue siendo
        válido (por ejemplo, dentro de 10 min)."""
        if not self.reset_token_expiration:
            return False
        return (now() - self.reset_token_expiration).total_seconds() < 600

    def __str__(self):
        return self.username


class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE,
                                 related_name="reviews_given")
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE,
                                      related_name="reviews_received")
    rating = models.FloatField(default=0.0)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("reviewer", "reviewed_user")

    def __str__(self):
        return (
            f"{self.reviewer.username} → "
            f"{self.reviewed_user.username}: {self.rating}"
        )


class Report(models.Model):

    CATEGORIES = [
        ('Mensaje de Odio', 'Mensaje de Odio'),
        ('Información Engañosa', 'Información Engañosa'),
        ('Se hace pasar por otra persona', 'Se hace pasar por otra persona'),
        ('Otro', 'Otro')
    ]

    STATUS = [
        ('Pendiente', 'Pendiente'),
        ('En revisión', 'En revisión'),
        ('Resuelto', 'Resuelto')
    ]

    reporter = models.ForeignKey(User, on_delete=models.CASCADE,
                                 related_name="reports_given", blank=False,
                                 null=False)
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE,
                                      related_name="reports_received",
                                      blank=False, null=False)
    description = models.TextField(blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(choices=CATEGORIES, max_length=255,
                                blank=False, null=False)
    status = models.CharField(choices=STATUS, max_length=255,
                              default='Pendiente', blank=False, null=False)

    def __str__(self):
        return (
            f"{self.reporter.username} → "
            f"{self.reported_user.username}: {self.category}"
        )
