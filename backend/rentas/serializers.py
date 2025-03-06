from rest_framework import serializers
from .models import Rent

# Sirve para validar los datos que llegan del formulario y mapearlos al modelo


class RentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rent
        fields = '__all__'

    def validate(self, data):
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                {"end_date": "La fecha de fin debe ser posterior '"
                    'a la fecha de inicio."'}
            )
        return data
