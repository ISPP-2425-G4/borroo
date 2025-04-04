from rest_framework import serializers
from objetos.serializers import ItemSerializer
from .models import Review, User, Report
import re


class UserSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'name', 'surname', 'username', 'password', 'email',
            'phone_number', 'country', 'city', 'address', 'postal_code', 'cif',
            'dni',
            'is_verified', 'pricing_plan', 'owner_rating', 'renter_rating',
            'items', 'is_admin'
        ]
        read_only_fields = ['id', 'owner_rating', 'renter_rating', 'items',
                            'is_admin']

    def validate_username(self, value):
        if " " in value:
            raise serializers.ValidationError(
                "El nombre de usuario no puede contener espacios."
            )
        return value

    def validate(self, data):
        fields_to_validate = ["name", "surname", "country", "city", "address"]
        for field in fields_to_validate:
            if field in data and not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ]',
                                              data[field]):
                raise serializers.ValidationError(
                    {field: "Debe comenzar con una letra."}
                )
        return data

    def validate_dni(self, value):
        pattern = r'^\d{8}[A-Za-z]$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "DNI no es válido. Debe tener 8 números seguidos de una letra."
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

        # Validar que el DNI tenga el formato correcto (8 dígitos + 1 letra)
        pattern = r'^\d{8}[A-Za-z]$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "El DNI no es válido. Debe tener 8 dígitos seguidos de una"
                "letra."
            )
        return value


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reported_user', 'description',
                  'created_at', 'category', 'status']
