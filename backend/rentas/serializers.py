from rest_framework import serializers
from .models import Rent

# Sirve para validar los datos que llegan del formulario y mapearlos al modelo


class RentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rent
        fields = '__all__'

    def validDate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError(
                "La fecha de inicio debe ser antes de la fecha de fin."
                )
        return data
