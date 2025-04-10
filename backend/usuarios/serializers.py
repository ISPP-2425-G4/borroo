from utils.utils import upload_image_to_imgbb
from rest_framework import serializers
from objetos.serializers import ItemSerializer
from .models import Review, User, Report
from usuarios.models import FERNET
import re


class UserSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)
    user_image = serializers.ImageField(write_only=True, required=False)
    dni = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'name', 'surname', 'username', 'password', 'email',
            'phone_number', 'country', 'city', 'address', 'postal_code', 'cif',
            'dni',
            'is_verified', 'pricing_plan', 'owner_rating', 'renter_rating',
            'items', 'is_admin', 'image', 'user_image',
            "subscription_start_date", "subscription_end_date",
            "is_subscription_active",
        ]
        read_only_fields = ['id', 'owner_rating', 'renter_rating', 'items',
                            'is_admin']

    def update(self, instance, validated_data):
        """Sobrescribir el método update para manejar la imagen y el DNI."""
        print("Datos recibidos para actualizar:", validated_data)
        user_image = validated_data.pop('user_image', None)
        if user_image:
            instance.image = upload_image_to_imgbb(user_image)
        dni = validated_data.pop('dni', None)
        if dni is not None:
            instance.dni = dni
        return super().update(instance, validated_data)

    def validate_username(self, value):
        if " " in value:
            raise serializers.ValidationError(
                "El nombre de usuario no puede contener espacios."
            )
        return value

    def validate(self, data):
        if 'dni' in data and self.instance:
            dni = data['dni']
            try:
                encrypted_dni = FERNET.encrypt(dni.encode()).decode()
                if User.objects.filter(_dni=encrypted_dni).exclude(
                    id=self.instance.id
                ).exists():
                    raise serializers.ValidationError({
                        'dni': (
                            "El DNI ya está registrado. Por favor, utiliza uno"
                            "diferente."
                        )
                    })
            except Exception as e:
                print(f"Error al cifrar DNI: {str(e)}")
                raise serializers.ValidationError({
                    'dni': "Error al procesar el DNI"
                })

        fields_to_validate = ["name", "surname", "country", "city", "address"]
        for field in fields_to_validate:
            if field in data and data[field]:
                if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ]', data[field]):
                    raise serializers.ValidationError(
                        {field: "Debe comenzar con una letra."}
                    )
        return data

    def validate_dni(self, value):
        """Validar que el DNI sea válido."""
        if value is None:
            return value
        if value == "":
            raise serializers.ValidationError("El DNI no puede estar vacío.")

        pattern = r'^\d{8}[A-Z]$'  # Solo letras mayúsculas
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                (
                    "El DNI debe tener exactamente 8 números seguidos de una "
                    "letra mayúscula."
                )
            )
        return value


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(
        source="reviewer.username", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "reviewer_username", "reviewed_user",
                  "rating", "comment"]


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'name', 'surname', 'username', 'email', 'password', 'cif', 'dni'
        ]

    def validate_username(self, value):
        """Validar que el username no tenga espacios en blanco."""
        if " " in value:
            raise serializers.ValidationError(
                "El nombre de usuario no puede contener espacios."
            )
        return value

    def validate_password(self, value):
        """Validar que la contraseña cumpla con los requisitos."""
        if len(value) < 8:
            raise serializers.ValidationError(
                "La contraseña debe tener al menos 8 caracteres"
            )
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError(
                "La contraseña debe contener al menos una mayúscula"
            )
        if not any(c.islower() for c in value):
            raise serializers.ValidationError(
                "La contraseña debe contener al menos una minúscula"
            )
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError(
                "La contraseña debe contener al menos un número"
            )
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in value):
            raise serializers.ValidationError(
                "La contraseña debe contener al menos un carácter especial"
            )
        return value

    def validate(self, data):
        """Validar que los campos comiencen con una letra
         y que las contraseñas coincidan."""
        # Validar que los campos comiencen con una letra
        fields_to_validate = ["name", "surname"]
        for field in fields_to_validate:
            if field in data and not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ]',
                                              data[field]):
                raise serializers.ValidationError(
                    {field: "Debe comenzar con una letra."}
                )
        return data

    def validate_cif(self, value):
        """Validar que el CIF sea válido o None, pero no cadena vacía."""
        if value is None:
            return value
        if value == "":
            raise serializers.ValidationError(
                "El CIF no puede estar vacío."
             )

        pattern = r'^[A-HJ-NP-SUVW]\d{7}[0-9A-J]$'
        if not re.match(
            pattern, value
        ):
            raise serializers.ValidationError(
                "El CIF no es válido. Debe comenzar con una"
                "letra seguida de 7 dígitos y una letra o número final."
            )
        return value

    def validate_dni(self, value):
        """Validar que el DNI sea válido."""
        if value is None:
            return value
        if value == "":
            raise serializers.ValidationError("El DNI no puede estar vacío.")

        pattern = r'^\d{8}[A-Z]$'  # Solo letras mayúsculas
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                (
                    "El DNI debe tener exactamente 8 números seguidos de una "
                    "letra mayúscula."
                )
            )
        return value


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reported_user', 'description',
                  'created_at', 'category', 'status']
