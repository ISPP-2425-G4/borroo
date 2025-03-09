from rest_framework import serializers
from .models import Item


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

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'category_display',
            'cancel_type', 'cancel_type_display', 'price_category',
            'price_category_display', 'price'
        ]

    def create(self, validated_data):
        return Item.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get(
            'description', instance.description
        )
        instance.category = validated_data.get('category', instance.category)
        instance.cancel_type = validated_data.get(
            'cancel_type', instance.cancel_type
        )
        instance.price_category = validated_data.get(
            'price_category', instance.price_category
        )
        instance.price = validated_data.get('price', instance.price)
        instance.save()
        return instance
