from rest_framework import serializers
from .models import Item, ItemImage
import os
from django.conf import settings


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image']


class ItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source='get_category_display', read_only=True
    )
    cancel_type_display = serializers.CharField(
        source='get_cancel_type_display', read_only=True
    )
    price_category_display = serializers.CharField(
        source='get_price_category_display', read_only=True
    )
    image_files = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'category_display',
            'cancel_type', 'cancel_type_display', 'price_category',
            'price_category_display', 'price', 'images', 'image_files'
        ]

    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])
        validated_data.pop('images', None)

        # Crear el item sin la relación many-to-many
        item = Item.objects.create(**validated_data)

        # Guardar las imágenes asociadas al item
        for image in image_files:
            ItemImage.objects.create(item=item, image=image)

        return item

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.category = validated_data.get('category', instance.category)
        instance.cancel_type = validated_data.get('cancel_type', instance.cancel_type)
        instance.price_category = validated_data.get('price_category', instance.price_category)
        instance.price = validated_data.get('price', instance.price)

        # 🔥 Recuperamos las imágenes a eliminar
        images_to_delete = self.context['request'].data.getlist('images_to_delete', [])

        if images_to_delete:
            for image_id in images_to_delete:
                try:
                    old_image = ItemImage.objects.get(id=image_id, item=instance)
                    image_path = os.path.join(settings.MEDIA_ROOT, str(old_image.image))
                    if os.path.exists(image_path):
                        os.remove(image_path)  # Eliminar archivo del sistema
                    old_image.delete()  # Eliminar de la base de datos
                except ItemImage.DoesNotExist:
                    pass  # Si la imagen no existe, ignoramos el error

        # 🔥 Agregar imágenes nuevas sin eliminar las anteriores
        image_files = validated_data.pop('image_files', None)
        if image_files:
            for image in image_files:
                ItemImage.objects.create(item=instance, image=image)

        instance.save()
        return instance