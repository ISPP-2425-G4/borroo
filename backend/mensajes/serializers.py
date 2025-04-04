from rest_framework import serializers
from .models import Chat, Message


class ChatSerializer(serializers.ModelSerializer):
    rent_id = serializers.IntegerField(source='rent.id', read_only=True)
    item_title = serializers.CharField(source='rent.item.title',
                                       read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'rent_id', 'item_title', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username',
                                            read_only=True)
    receiver_username = serializers.CharField(source='receiver.username',
                                              read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'chat', 'sender', 'receiver', 'sender_username',
            'receiver_username', 'content', 'timestamp'
        ]
        read_only_fields = ['timestamp']

    def validate(self, data):
        sender = data.get('sender')
        receiver = data.get('receiver')
        chat = data.get('chat')

        if not chat.rent:
            error = "El chat debe estar asociado a un alquiler."
            raise serializers.ValidationError(error)

        allowed_users = [chat.rent.renter, chat.rent.item.user]
        if sender not in allowed_users or receiver not in allowed_users:
            raise serializers.ValidationError(
                "Solo el dueño y el solicitante pueden enviarse mensajes."
            )

        if sender == receiver:
            raise serializers.ValidationError(
                "No puedes enviarte un mensaje a ti mismo."
            )

        return data
