from datetime import timedelta
from rest_framework import serializers
from .models import Rent
import calendar

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

        year = end_date.year
        month = end_date.month

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
            elif price_category == "week":
                expected_duration = timedelta(days=7)
                actual_duration = end_date - start_date
                if (actual_duration < expected_duration
                        or actual_duration > expected_duration):
                    raise serializers.ValidationError({
                        "end_date": "El rango debe abarcar 7 días para "
                        "alquiler semanal."
                    })
            elif price_category == "month":
                if start_date.day != 1:
                    raise serializers.ValidationError({
                        "start_date": "Para alquiler mensual, la fecha de "
                        "inicio debe ser el primer día del mes."
                    })
                first_weekday, num_days = calendar.monthrange(year, month)
                if end_date.day != num_days:
                    raise serializers.ValidationError({
                        "end_date": "La fecha de fin debe ser el último "
                        "día del mes."
                    })
        return data
