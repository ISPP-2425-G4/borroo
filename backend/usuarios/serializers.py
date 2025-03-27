from rest_framework import serializers
from objetos.serializers import ItemSerializer
from .models import Review, User
import re


class UserSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'name', 'surname', 'username', 'password', 'email',
            'phone_number', 'country', 'city', 'address', 'postal_code',
            'is_verified', 'pricing_plan', 'owner_rating', 'renter_rating',
            'items', 'is_admin'
        ]
        read_only_fields = ['id', 'owner_rating', 'renter_rating', 'items',
                            'is_admin']

        def validate_username(self, value):
            """Validar que el username no tenga espacios en blanco."""
            if " " in value:
                raise serializers.ValidationError(
                    "El nombre de usuario no puede contener espacios."
                )
            return value

        def validate(self, data):
            """Validar que los campos comiencen con una letra"""
            fields_to_validate = ["name", "surname", "country", "city",
                                  "address"]
            for field in fields_to_validate:
                if field in data and not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ]',
                                                  data[field]):
                    raise serializers.ValidationError(
                        {field: "Debe comenzar con una letra."})
            return data


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
            'name', 'surname', 'username', 'email', 'password'
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
