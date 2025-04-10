from rest_framework import serializers
from .models import Chat, Message


class ChatSerializer(serializers.ModelSerializer):
    user1_username = serializers.CharField(source='user1.username',
                                           read_only=True)
    user2_username = serializers.CharField(source='user2.username',
                                           read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'user1', 'user2', 'user1_username', 'user2_username',
                  'created_at']
        read_only_fields = ['created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username',
                                            read_only=True)
    receiver_username = serializers.CharField(source='receiver.username',
                                              read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'chat', 'sender', 'receiver', 'sender_username',
            'receiver_username', 'content', 'timestamp', 'is_read'
        ]
        read_only_fields = ['timestamp']

    def validate(self, data):
        sender = data.get('sender')
        receiver = data.get('receiver')
        chat = data.get('chat')

        if sender == receiver:
            error = "No puedes enviarte un mensaje a ti mismo."
            raise serializers.ValidationError(error)

        allowed_users = [chat.user1, chat.user2]
        if sender not in allowed_users or receiver not in allowed_users:
            error = "Ambos usuarios deben formar parte del chat."
            raise serializers.ValidationError(error)

        return data
