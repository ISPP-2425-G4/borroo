from datetime import datetime, timedelta
from requests import Response
from rest_framework import serializers
from .models import Rent
from pagos.models import PaidPendingConfirmation

# Sirve para validar los datos que llegan del formulario y mapearlos al modelo


class PaidPendingConfirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaidPendingConfirmation
        fields = ['is_confirmed_by_owner', 'is_confirmed_by_renter']


class RentSerializer(serializers.ModelSerializer):
    renter_reported = serializers.SerializerMethodField()
    owner_reported = serializers.SerializerMethodField()
    renter_name = serializers.CharField(
        source='renter.username', read_only=True)

    paid_pending_confirmation = PaidPendingConfirmationSerializer(
        read_only=True
    )

    class Meta:
        model = Rent
        fields = '__all__'
        read_only_fields = ('item', 'renter')

    def validate(self, data):
        item = self.context.get('item_instance') or getattr(
            self.instance, 'item', None)
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        # Convertir strings a datetime si es necesario
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date)
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date)

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                {"end_date": "La fecha de fin debe ser posterior '"
                    'a la fecha de inicio."'}
            )
        # Comprobar si la fecha actual es posterior a end_date
        if end_date and datetime.now() > end_date:
            raise serializers.ValidationError({
                "end_date": "La fecha de fin no puede ser anterior a la fecha actual."
            })

        if start_date and start_date.tzinfo is not None:
            start_date = start_date.replace(tzinfo=None)
        if end_date and end_date.tzinfo is not None:
            end_date = end_date.replace(tzinfo=None)

        data["start_date"] = start_date
        data["end_date"] = end_date

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
                total_days = (end_date - start_date).days
                if (total_days % 30 or total_days % 31):
                    raise serializers.ValidationError({
                        "El alquiler debe ser por meses"
                    })

        return data

    def create(self, validated_data):

        rent = super().create(validated_data)

        # Cálculos y procesamiento adicional
        rent.total_price = rent.calculate_total_price()
        rent.commission = rent.calculate_commission()
        rent.save()

        return rent

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.total_price = instance.calculate_total_price()
        instance.commission = instance.calculate_commission()
        instance.save()
        return instance

    def delete_rent(self, request, pk=None):
        try:
            rent = self.get_object()
            rent.delete()
            return Response({
                "message": f"Renta {rent.id} eliminada correctamente."
            }, status=Response.HTTP_204_NO_CONTENT)
        except Rent.DoesNotExist:
            return Response({
                "error": "Renta no encontrada."
            }, status=Response.HTTP_404_NOT_FOUND)

    def get_renter_reported(self, obj):
        return obj.tickets.filter(reporter=obj.renter).exists()

    def get_owner_reported(self, obj):
        return obj.tickets.filter(reporter=obj.item.user).exists()
