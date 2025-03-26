from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from objetos.models import Item
from rentas.models import Rent, RentStatus
from decimal import Decimal
from usuarios.models import User


class RentTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.renter = User.objects.create(
            username="renter",
            password="testpassword",
            email="renter@example.com",
            name="Renter",
            surname="User",
            phone_number="123456789",
            country="Country",
            city="City",
            address="Renter Address",
            postal_code="12345",
            is_verified=True,
            pricing_plan="free"
        )

        self.owner = User.objects.create(
            username="owner",
            password="testpassword",
            email="owner@example.com",
            name="Owner",
            surname="User",
            phone_number="987654321",
            country="Country",
            city="City",
            address="Owner Address",
            postal_code="54321",
            is_verified=True,
            pricing_plan="free"
        )

        self.client.force_authenticate(user=self.renter)

    def test_take_rent(self):
        item = Item.objects.create(title="Laptop", price=50.0,
                                   price_category="day", user=self.owner)

        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=3)

        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }

        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")
        self.assertEqual(response.status_code, 201)

        rent = Rent.objects.get(item=item, renter=self.renter)
        self.assertEqual(rent.rent_status, RentStatus.REQUESTED)
        self.assertEqual(rent.start_date, start_date)
        self.assertEqual(rent.end_date, end_date)
        self.assertEqual(rent.total_price, round(3 * 50 * 1.075, 2))
        self.assertEqual(rent.commission, round(3 * 50 * 0.15, 2))

        response_conflict = self.client.post("/rentas/full/first_request/",
                                             rent_data, format="json")
        self.assertEqual(response_conflict.status_code, 400)
        self.assertIn("error", response_conflict.data)
        self.assertEqual(response_conflict.data["error"],
                         "El objeto no está disponible en esas fechas")

    def test_rent_invalid_dates(self):
        item = Item.objects.create(title="Bicicleta", price=30.0,
                                   price_category="day", user=self.owner)

        start_date = timezone.now()
        end_date = start_date  # Igual que la fecha de inicio

        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }

        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.data)
        self.assertIn("posterior", str(response.data["end_date"][0]))

    def test_rent_non_existent_item(self):
        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=3)

        rent_data = {
            "item": 9999,  # ID inexistente
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }

        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")
        self.assertEqual(response.status_code, 404)

    def test_rent_overlapping_dates(self):
        item = Item.objects.create(title="Proyector", price=Decimal("80.0"),
                                   price_category="day", user=self.owner)

        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=2)

        Rent.objects.create(item=item, renter=self.renter,
                            start_date=start_date,
                            end_date=end_date,
                            rent_status=RentStatus.REQUESTED)

        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }

        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"],
                         "El objeto no está disponible en esas fechas")

    def test_rental_requests(self):
        item = Item.objects.create(
            title="Cámara",
            price=Decimal("100.0"),
            price_category="day",
            user=self.owner
        )

        Rent.objects.create(
            item=item,
            renter=self.renter,
            rent_status=RentStatus.REQUESTED,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=2)
        )

        response = self.client.get("/rentas/full/rental_requests/",
                                   {"user": self.owner.id})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["item"], item.id)
        self.assertEqual(response.data[0]["renter"], self.renter.id)

    def test_my_requests(self):
        item = Item.objects.create(
            title="Altavoz",
            price=Decimal("100.0"),
            price_category="day",
            user=self.owner
        )

        Rent.objects.create(
            item=item,
            renter=self.renter,
            rent_status=RentStatus.ACCEPTED,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=1)
        )

        Rent.objects.create(
            item=item,
            renter=self.renter,
            rent_status=RentStatus.REQUESTED,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=2)
        )

        response = self.client.get("/rentas/full/my_requests/",
                                   {"user": self.renter.id})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        for rent in response.data:
            self.assertEqual(rent["renter"], self.renter.id)
