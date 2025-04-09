from django.test import TestCase
from rest_framework.test import APIClient
from usuarios.models import User
from chats.models import Chat, Message


class ChatTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username="user1", email="u1@test.com", password="pass")
        self.user2 = User.objects.create_user(username="user2", email="u2@test.com", password="pass")
        self.chat = Chat.objects.create(user1=self.user1, user2=self.user2)
        self.client.force_authenticate(user=self.user1)

    def test_send_message(self):
        response = self.client.post(
            f"/chats/{self.chat.id}/send_message/",
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
        outsider = User.objects.create_user(username="intruso", email="intru@test.com", password="pass")
        self.client.force_authenticate(user=outsider)

        response = self.client.post(
            f"/chats/{self.chat.id}/send_message/",
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
            f"/chats/{self.chat.id}/send_message/",
            {"content": ""}, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_message_saved_correctly(self):
        content = "Hola, ¿todo bien?"

        self.client.post(
            f"/chats/{self.chat.id}/send_message/",
            {"content": content}, format="json"
        )

        message = Message.objects.first()
        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.receiver, self.user2)
        self.assertEqual(message.chat, self.chat)
        self.assertEqual(message.content, content)

    def test_create_chat_with_self_fails(self):
        response = self.client.post("/chats/", {"otherUserId": self.user1.id})
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_create_chat_with_nonexistent_user_fails(self):
        response = self.client.post("/chats/", {"otherUserId": 9999})
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_create_duplicate_chat_fails(self):
        response = self.client.post("/chats/", {"otherUserId": self.user2.id})
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_get_my_chats_returns_data(self):
        response = self.client.get("/chats/get_my_chats/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)

    def test_get_chat_messages_forbidden_if_not_in_chat(self):
        outsider = User.objects.create_user(username="outsider", email="out@test.com", password="pass")
        self.client.force_authenticate(user=outsider)
        response = self.client.get(f"/chats/{self.chat.id}/messages/")
        self.assertEqual(response.status_code, 404)

    def test_get_chat_with_user_success(self):
        response = self.client.get(f"/chats/get_chat_with/{self.user2.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user1"], self.user1.id)
        self.assertEqual(response.data["user2"], self.user2.id)

    def test_get_chat_with_self_fails(self):
        response = self.client.get(f"/chats/get_chat_with/{self.user1.id}/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_get_chat_with_nonexistent_user_fails(self):
        response = self.client.get("/chats/get_chat_with/9999/")
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.data)
