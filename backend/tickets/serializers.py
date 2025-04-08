from rest_framework import serializers
from .models import Ticket, TicketImage
from rentas.models import Rent


class TicketImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketImage
        fields = ['id', 'image', 'uploaded_at']


class TicketSerializer(serializers.ModelSerializer):
    images = TicketImageSerializer(many=True, read_only=True)
    reporter = serializers.StringRelatedField(read_only=True)
    manager = serializers.StringRelatedField(read_only=True)
    rent = serializers.PrimaryKeyRelatedField(queryset=Rent.objects.all())
    status_display = serializers.CharField(source='get_status_display',
                                           read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id',
            'rent',
            'reporter',
            'manager',
            'description',
            'created_at',
            'updated_at',
            'closed_at',
            'status',
            'status_display',
            'images',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'closed_at',
                            'reporter', 'manager']

    def create(self, validated_data):
        if "rent" not in validated_data:
            rent_id = self.context.get('rentId')
            if rent_id:
                validated_data["rent"] = rent_id
            else:
                raise serializers.ValidationError(
                    {"rent": "Este campo es obligatorio."}
                    )

        validated_data['reporter'] = self.context['request'].user
        ticket = super().create(validated_data)

        images = self.context['request'].FILES.getlist('image_files')
        for image_file in images:
            TicketImage.objects.create(ticket=ticket, image=image_file)

        return ticket

    def update(self, instance, validated_data):
        user = self.context['request'].user

        # Solo los admins pueden cambiar el estado y el manager
        if not user.is_admin:
            validated_data.pop('status', None)
            validated_data.pop('manager', None)
            validated_data.pop('closed_at', None)

        return super().update(instance, validated_data)

    def validate(self, data):
        if not self.context['request'].FILES.getlist('image_files'):
            raise serializers.ValidationError(
                {"image_files": "Por favor, selecciona al menos una imagen."})
        return data
