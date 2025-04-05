from django.test import TestCase
from rest_framework.test import APIClient
from usuarios.models import User
from mensajes.models import Chat, Message


class ChatTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create(username="user1", email="u1@test.com")
        self.user2 = User.objects.create(username="user2", email="u2@test.com")
        self.chat = Chat.objects.create(user1=self.user1, user2=self.user2)
        self.client.force_authenticate(user=self.user1)

    def test_send_message(self):
        response = self.client.post(
            f"/mensajes/chats/{self.chat.id}/send_message/",
            {"content": "¡Hola!"},
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Message.objects.count(), 1)

        message = Message.objects.first()
        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.receiver, self.user2)
        self.assertEqual(message.content, "¡Hola!")

    def test_unauthorized_user_cannot_send_message(self):
        outsider = User.objects.create(username="intruso",
                                       email="intru@test.com")
        self.client.force_authenticate(user=outsider)

        response = self.client.post(
            f"/mensajes/chats/{self.chat.id}/send_message/",
            {"content": "¿Qué pasa?"}, format="json"
        )
        self.assertIn("detail", response.data)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            str(response.data["detail"]),
            "No Chat matches the given query."
        )

    def test_cannot_send_empty_message(self):
        response = self.client.post(
            f"/mensajes/chats/{self.chat.id}/send_message/",
            {"content": ""}, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_message_saved_correctly(self):
        content = "Hola, ¿todo bien?"

        self.client.post(
            f"/mensajes/chats/{self.chat.id}/send_message/",
            {"content": content}, format="json"
        )

        message = Message.objects.first()
        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.receiver, self.user2)
        self.assertEqual(message.chat, self.chat)
        self.assertEqual(message.content, content)
