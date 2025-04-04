from django.test import TestCase
from rest_framework.test import APIClient
from usuarios.models import User
from objetos.models import Item
from rentas.models import Rent
from .models import Chat, Message
from django.utils import timezone
from decimal import Decimal


class ChatTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create(username="user1", email="u1@test.com")
        self.user2 = User.objects.create(username="user2", email="u2@test.com")
        self.item = Item.objects.create(title="Objeto", price=Decimal("10.0"),
                                        user=self.user2)
        self.rent = Rent.objects.create(item=self.item, renter=self.user1,
                                        start_date=timezone.now(),
                                        end_date=timezone.now() +
                                        timezone.timedelta(days=1))
        self.chat = Chat.objects.create(rent=self.rent)
        self.client.force_authenticate(user=self.user1)

    def test_send_message(self):
        self.client.force_authenticate(user=self.user1)

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
