from datetime import timedelta
from rest_framework import serializers
from .models import Rent

# Sirve para validar los datos que llegan del formulario y mapearlos al modelo


class RentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rent
        fields = '__all__'
        read_only_fields = ('item', 'total_price', 'commission', 'rent_status',
                            'payment_status', 'renter')

    def validate(self, data):
        item = self.context.get('item_instance')
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                {"end_date": "La fecha de fin debe ser posterior '"
                    'a la fecha de inicio."'}
            )

        if item:
            price_category = item.price_category
            if price_category == "hour":
                expected_duration = timedelta(hours=23)
                actual_duration = end_date - start_date
                if actual_duration > expected_duration:
                    raise serializers.ValidationError({
                        "end_date": "El intervalo para alquiler por hora no "
                        "puede superar las 23 horas."
                    })
            elif price_category == "month":
                total_days = (end_date - start_date).days + 1
                if start_date.month == 2:
                    if total_days not in (28, 29):
                        raise serializers.ValidationError({
                            "start_date": "Para alquiler mensual en febrero,"
                            " el intervalo debe ser de 28 o 29 días."
                        })
                else:
                    if total_days not in (30, 31):
                        raise serializers.ValidationError({
                            "end_date": "Para alquiler mensual, "
                            "el intervalo debe ser de 30 o 31 días según"
                            "corresponda el mes"
                        })
        return data
