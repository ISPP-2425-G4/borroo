from rest_framework import serializers
from .models import Item, ItemImage, ItemRequest
from utils.utils import upload_image_to_imgbb


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
    remaining_image_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'category_display',
            'cancel_type', 'cancel_type_display', 'price_category',
            'price_category_display', 'price', 'images', 'image_files',
            'remaining_image_ids', 'user'
        ]

    def validate(self, data):
        """
        Validate that the user doesn't exceed the item limits.
        """
        user = data.get('user')
        draft_mode = data.get('draft_mode', False)

        # Restricción: No más de 10 ítems con draft_mode False
        item_count = Item.objects.filter(user=user, draft_mode=False).count()
        if not draft_mode and item_count >= 10:
            raise serializers.ValidationError(
                "No puedes tener más de 10 ítems con draft_mode en False."
            )

        # Restricción: No más de 15 ítems en total
        if Item.objects.filter(user=user).count() >= 15:
            raise serializers.ValidationError(
                "No puedes tener más de 15 ítems en total."
            )

        return data

    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])
        validated_data.pop('images', None)
        user = validated_data.pop('user')

        item = Item.objects.create(user=user, **validated_data)

        # Save associated images
        for image in image_files:
            image_url = upload_image_to_imgbb(image)
            ItemImage.objects.create(item=item, image=image_url)

        return item

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description',
                                                  instance.description)
        instance.category = validated_data.get('category', instance.category)
        instance.cancel_type = validated_data.get('cancel_type',
                                                  instance.cancel_type)
        instance.price_category = validated_data.get('price_category',
                                                     instance.price_category)
        instance.price = validated_data.get('price', instance.price)

        image_files = validated_data.pop('image_files', None)
        remaining_image_ids = validated_data.pop('remaining_image_ids', [])

        # Eliminar imágenes que no están en remaining_image_ids
        for old_image in instance.images.all():
            if old_image.id not in remaining_image_ids:
                old_image.delete()  # Eliminar registro en la base de datos

        # Agregar las nuevas imágenes
        if image_files is not None:
            for image in image_files:
                image_url = upload_image_to_imgbb(image)
                ItemImage.objects.create(item=instance, image=image_url)

        instance.save()
        return instance


class ItemRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemRequest
        fields = ['id', 'title', 'description',
                  'category', 'price', 'user', 'approved']
