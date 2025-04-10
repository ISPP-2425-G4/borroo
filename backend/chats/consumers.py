# chats/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Chat, Message
from usuarios.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.room_group_name = f"chat_{self.chat_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        message = data["message"]
        sender_id = data["sender_id"]
        receiver_id = data["receiver_id"]

        sender = await self.get_user(sender_id)
        receiver = await self.get_user(receiver_id)
        chat, user1, user2 = await self.get_chat_with_users(self.chat_id)

        # Seguridad: validar que ambos pertenecen al chat
        if sender not in [user1, user2] or receiver not in [user1, user2]:
            await self.close()
            return

        msg = await self.create_message(chat, sender, receiver, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": msg.content,
                "sender": sender.username,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender": event["sender"],
        }))

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def get_chat_with_users(self, chat_id):
        chat = Chat.objects.select_related("user1", "user2").get(id=chat_id)
        return chat, chat.user1, chat.user2

    @database_sync_to_async
    def create_message(self, chat, sender, receiver, content):
        return Message.objects.create(
            chat=chat, sender=sender, receiver=receiver, content=content
        )
