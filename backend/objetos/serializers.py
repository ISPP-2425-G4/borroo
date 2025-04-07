from rest_framework import serializers
from .models import Item, ItemImage, ItemRequest, UnavailablePeriod, LikedItem
from usuarios.models import Review
from utils.utils import upload_image_to_imgbb


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image']


class UnavailablePeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnavailablePeriod
        fields = ['id', 'start_date', 'end_date']


class ItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source='get_category_display', read_only=True
    )
    subcategory_display = serializers.CharField(
         source='get_subcategory_display', read_only=True
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
    unavailable_periods = UnavailablePeriodSerializer(
        many=True, required=False)
    user_rating = serializers.SerializerMethodField()
    user_location = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'category_display',
            'subcategory', 'subcategory_display', 'cancel_type',
            'cancel_type_display', 'price_category',
            'price_category_display', 'price', 'deposit', 'images',
            'image_files', 'remaining_image_ids', 'user',
            'draft_mode', 'unavailable_periods', 'featured',
            'user_rating', 'user_location',
            'num_likes'
        ]
        read_only_fields = ['user']

    def get_user_rating(self, obj):
        reviews = Review.objects.filter(reviewed_user=obj.user)
        if reviews.exists():
            return round(
                sum(review.rating for review in reviews) / reviews.count(), 2)
        return 0.0

    def get_user_location(self, obj):
        return obj.user.city

    def validate(self, data):
        """
        Validate that the user doesn't exceed the item limits.
        """
        user = self.context['request'].user
        draft_mode = data.get('draft_mode', False)
        image_files = self.initial_data.get('image_files')
        remaining_image_ids = data.get('remaining_image_ids', None)
        if remaining_image_ids:
            image_count = len(remaining_image_ids)
        else:
            image_count = 0

        # Restricción: No más de 10 ítems con draft_mode False
        item_count = Item.objects.filter(user=user, draft_mode=False).count()
        if not draft_mode and item_count >= 10:
            raise serializers.ValidationError(
                "No puedes tener más de 10 ítems publicados con el plan Free."
            )

        # Restricción: No más de 15 ítems en total
        if Item.objects.filter(user=user).count() >= 15:
            raise serializers.ValidationError(
                "No puedes tener más de 15 ítems en total con el plan Free."
            )

        # Restricción: Debe subir al menos una imagen
        image_files = data.get('image_files', [])
        if not draft_mode and ((not image_files or len(image_files) == 0)
                               and image_count == 0):
            raise serializers.ValidationError({
                "image_files":
                "Debes subir al menos una imagen para publicar el ítem."
            })

        return data

    def create(self, validated_data):
        image_files = validated_data.pop(
            'image_files', [])
        unavailable_periods_data = validated_data.pop(
            'unavailable_periods', [])
        validated_data.pop('images', None)
        user = self.context['request'].user
        print(user)

        # Restricción: No más de 10 ítems con draft_mode False
        if Item.objects.filter(user=user, draft_mode=False).count() >= 10:
            raise serializers.ValidationError(
                "No puedes tener más de 10 ítems publicados con el plan Free."
            )

        # Restricción: No más de 15 ítems en total
        if Item.objects.filter(user=user).count() >= 15:
            raise serializers.ValidationError(
                "No puedes tener más de 15 ítems en total con el plan Free."
            )

        item = Item.objects.create(user=user, **validated_data)

        # Save associated images
        for image in image_files:
            image_url = upload_image_to_imgbb(image)
            ItemImage.objects.create(item=item, image=image_url)

        # Save unavailable periods
        for period_data in unavailable_periods_data:
            UnavailablePeriod.objects.create(item=item, **period_data)

        return item

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description',
                                                  instance.description)
        instance.category = validated_data.get('category', instance.category)
        instance.subcategory = validated_data.get('subcategory',
                                                  instance.subcategory)
        instance.cancel_type = validated_data.get('cancel_type',
                                                  instance.cancel_type)
        instance.price_category = validated_data.get('price_category',
                                                     instance.price_category)
        instance.price = validated_data.get('price', instance.price)
        instance.deposit = validated_data.get('deposit', instance.deposit)
        image_files = validated_data.pop('image_files', None)
        remaining_image_ids = validated_data.pop('remaining_image_ids', [])
        unavailable_periods_data = validated_data.pop(
            'unavailable_periods', [])

        # Eliminar imágenes que no están en remaining_image_ids
        for old_image in instance.images.all():
            if old_image.id not in remaining_image_ids:
                old_image.delete()  # Eliminar registro en la base de datos

        # Agregar las nuevas imágenes
        if image_files is not None:
            for image in image_files:
                image_url = upload_image_to_imgbb(image)
                ItemImage.objects.create(item=instance, image=image_url)

        # Actualizar periodos de indisponibilidad
        for period_data in unavailable_periods_data:
            UnavailablePeriod.objects.create(item=instance, **period_data)

        instance.save()
        return instance


class LikedItemSerializer(serializers.ModelSerializer):
    model = LikedItem
    fields = ['id', 'user', 'item']


class ItemRequestSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source='get_category_display', read_only=True
    )
    subcategory_display = serializers.CharField(
         source='get_subcategory_display', read_only=True
     )
    cancel_type_display = serializers.CharField(
        source='get_cancel_type_display', read_only=True
    )
    price_category_display = serializers.CharField(
        source='get_price_category_display', read_only=True
    )

    class Meta:
        model = ItemRequest
        fields = [
            'id', 'title', 'description',
            'category', 'category_display', 'subcategory',
            'subcategory_display', 'price', 'deposit', 'price_category',
            'cancel_type', 'cancel_type_display',
            'price_category_display', 'user', 'approved']
