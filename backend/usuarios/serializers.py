from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'name', 'surname', 'username', 'country', 'city', 
            'address', 'postal_code', 'is_verified', 'pricing_plan', 
            'owner_rating', 'renter_rating'
        ]
        read_only_fields = ['id', 'owner_rating', 'renter_rating']