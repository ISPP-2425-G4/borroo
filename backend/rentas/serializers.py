from requests import Response
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
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError(
                {"end_date": "La fecha de fin debe ser posterior '"
                    'a la fecha de inicio."'}
            )
        return data

    def create(self, validated_data):

        rent = super().create(validated_data)

        # Cálculos y procesamiento adicional
        rent.total_price = rent.calculate_total_price()
        rent.commission = rent.calculate_commission()
        rent.save()

        return rent

    def update(self, instance, validated_data):

        instance.start_date = validated_data.get('start_date',
                                                 instance.start_date)
        instance.end_date = validated_data.get('end_date',
                                               instance.end_date)
        instance.rent_status = validated_data.get('rent_status',
                                                  instance.rent_status)
        instance.payment_status = validated_data.get('payment_status',
                                                     instance.payment_status)

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
