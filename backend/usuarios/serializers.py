from rest_framework import serializers
from .models import User
import re


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'name', 'surname', 'username', 'password', 'email',
            'phone_number', 'country', 'city', 'address', 'postal_code',
            'is_verified', 'pricing_plan', 'owner_rating', 'renter_rating'
        ]
        read_only_fields = ['id', 'owner_rating', 'renter_rating']

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
