from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from borroo.asgi import application
from chats.models import Chat, Message
from usuarios.models import User
from asgiref.sync import sync_to_async


class WebSocketChatTests(TransactionTestCase):
    async def test_websocket_chat(self):

        user1 = await sync_to_async(User.objects.create_user)(
            username="user1", email="u1@test.com", password="pass1234"
        )
        user2 = await sync_to_async(User.objects.create_user)(
            username="user2", email="u2@test.com", password="pass1234"
        )
        chat = await sync_to_async(Chat.objects.create)(user1=user1,
                                                        user2=user2)

        # Conexión WebSocket simulada
        communicator = WebsocketCommunicator(application,
                                             f"/ws/chats/{chat.id}/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Enviar mensaje
        await communicator.send_json_to({
            "type": "chat.message",
            "message": "Hola desde el test!",
            "sender_id": user1.id,
            "receiver_id": user2.id,
        })

        # Esperar respuesta
        response = await communicator.receive_json_from()
        self.assertEqual(response["message"], "Hola desde el test!")

        # Verificar mensaje en DB de forma segura
        message = await sync_to_async(Message.objects.first)()
        self.assertEqual(message.content, "Hola desde el test!")

        sender_id = await sync_to_async(lambda: message.sender.id)()
        receiver_id = await sync_to_async(lambda: message.receiver.id)()

        self.assertEqual(sender_id, user1.id)
        self.assertEqual(receiver_id, user2.id)

        await communicator.disconnect()
