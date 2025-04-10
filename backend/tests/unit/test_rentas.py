from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from objetos.models import Item
from rentas.models import Rent, RentStatus, PaymentStatus
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

    def create_item(self):
        return Item.objects.create(
            title="Laptop",
            price=Decimal("50.00"),
            deposit=Decimal("10.00"),
            price_category="day",
            cancel_type="flexible",
            category="technology",
            subcategory="computers",
            user=self.owner
        )

    def test_take_rent(self):
        item = self.create_item()
        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=3)

        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }

        response = self.client.post(
            "/rentas/full/first_request/", rent_data, format="json"
        )
        self.assertEqual(response.status_code, 201)

        rent = Rent.objects.get(item=item, renter=self.renter)
        self.assertEqual(rent.rent_status, RentStatus.REQUESTED)

        response_conflict = self.client.post(
            "/rentas/full/first_request/", rent_data, format="json"
        )
        self.assertEqual(response_conflict.status_code, 400)
        self.assertIn("error", response_conflict.data)
        self.assertIn(
            "Ya tienes una solicitud pendiente",
            response_conflict.data["error"]
        )

    def test_rent_invalid_dates(self):
        item = Item.objects.create(
            title="Bicicleta",
            price=30.0,
            deposit=10.0,
            price_category="day",
            user=self.owner
        )

        start_date = timezone.now()
        # Fin antes que inicio
        end_date = start_date - timezone.timedelta(days=1)

        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }

        response = self.client.post(
            "/rentas/full/first_request/", rent_data, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.data)

    def test_rent_non_existent_item(self):
        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=3)

        rent_data = {
            "item": 9999,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }

        response = self.client.post(
            "/rentas/full/first_request/", rent_data, format="json"
        )
        self.assertEqual(response.status_code, 404)

    def test_rent_overlapping_dates(self):
        item = self.create_item()
        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=2)

        Rent.objects.create(item=item, renter=self.renter,
                            start_date=start_date,
                            end_date=end_date,
                            rent_status=RentStatus.ACCEPTED)

        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }

        response = self.client.post(
            "/rentas/full/first_request/", rent_data, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("El objeto no está disponible", response.data["error"])

    def test_rental_requests(self):
        item = self.create_item()
        Rent.objects.create(
            item=item,
            renter=self.renter,
            rent_status=RentStatus.REQUESTED,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=2)
        )

        response = self.client.get(
            "/rentas/full/rental_requests/", {"user": self.owner.id}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_my_requests(self):
        item = self.create_item()

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

        response = self.client.get(
            "/rentas/full/my_requests/", {"user": self.renter.id}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_has_rented_from_view(self):
        item = self.create_item()
        Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=3),
            rent_status=RentStatus.BOOKED,
            payment_status=PaymentStatus.PAID
        )

        response = self.client.get("/rentas/full/has-rented-from/", {
            "renter": self.renter.username,
            "owner": self.owner.username
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["has_rented"])

    def test_respond_request_accepts_and_cancels_others(self):
        item = Item.objects.create(
            title="Tablet",
            price=Decimal("60.0"),
            deposit=Decimal("10.0"),
            price_category="day",
            cancel_type="flexible",
            user=self.owner
        )
        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=1)

        accepted_rent = Rent.objects.create(
            item=item, renter=self.renter,
            start_date=start_date, end_date=end_date,
            rent_status=RentStatus.REQUESTED
        )
        other_renter = User.objects.create_user(
            username="otro",
            password="1234",
            email="otro@example.com"
        )
        other_rent = Rent.objects.create(
            item=item, renter=other_renter,
            start_date=start_date, end_date=end_date,
            rent_status=RentStatus.REQUESTED
        )

        self.client.force_authenticate(user=self.owner)
        response = self.client.put(
            f"/rentas/full/{accepted_rent.id}/respond_request/",
            {
                "rent": accepted_rent.id,
                "response": "accepted",
                "user_id": self.owner.id
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        accepted_rent.refresh_from_db()
        other_rent.refresh_from_db()
        self.assertEqual(accepted_rent.rent_status, RentStatus.ACCEPTED)
        self.assertEqual(other_rent.rent_status, RentStatus.CANCELLED)

    def test_cancel_rent_by_renter(self):
        item = Item.objects.create(
            title="Balón",
            price=Decimal("25.0"),
            deposit=Decimal("10.0"),
            price_category="day",
            cancel_type="medium",
            user=self.owner
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=1),
            rent_status=RentStatus.ACCEPTED
        )

        self.client.force_authenticate(user=self.renter)
        response = self.client.put(f"/rentas/full/{rent.id}/cancel_rent/")
        self.assertEqual(response.status_code, 200)
        rent.refresh_from_db()
        self.assertEqual(rent.rent_status, RentStatus.CANCELLED)

    def test_calculate_rental_duration_and_price(self):
        item = Item.objects.create(
            title="Libro",
            price=Decimal("10.0"),
            deposit=Decimal("10.0"),
            price_category="day",
            cancel_type="flexible",
            user=self.owner
        )
        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=4)

        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=start_date,
            end_date=end_date
        )

        self.assertEqual(rent.calculate_rental_duration(), 5)  # 4 días + 1
        self.assertEqual(
            round(rent.total_price, 2),
            float(round(Decimal("10.0") * Decimal("5"), 2))
        )
        expected_commission = float(
            round(Decimal("50.0") * Decimal("0.15"), 2)
        )
        self.assertEqual(round(rent.commission, 2), expected_commission)

    def test_get_rent_unauthenticated(self):
        rent = Rent.objects.create(
            item=self.create_item(),
            renter=self.renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=1),
        )
        self.client.force_authenticate(user=None)
        response = self.client.get(f"/rentas/full/{rent.id}/")
        self.assertEqual(response.status_code, 401)

    def test_get_rent_not_owner(self):
        other_user = User.objects.create_user(
            username="hacker", email="hacker@example.com", password="pass"
        )
        self.client.force_authenticate(user=other_user)

        item = self.create_item()
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=1),
        )

        response = self.client.get(f"/rentas/full/{rent.id}/")
        self.assertEqual(response.status_code, 403)

    def test_return_too_early(self):
        item = self.create_item()
        start = timezone.now() + timezone.timedelta(days=1)
        end = start + timezone.timedelta(days=1)

        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=start,
            end_date=end,
            rent_status=RentStatus.PICKED_UP,
        )

        self.client.force_authenticate(user=self.owner)
        response = self.client.put(f"/rentas/full/{rent.id}/change_status/", {
            "response": "RETURNED"
        }, format="json")

        self.assertEqual(response.status_code, 403)

    def test_cancel_rent_unauthenticated(self):
        item = self.create_item()
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=2),
            rent_status=RentStatus.ACCEPTED
        )

        self.client.force_authenticate(user=None)
        response = self.client.put(f"/rentas/full/{rent.id}/cancel_rent/")
        self.assertEqual(response.status_code, 401)

    def test_cancel_invalid_status(self):
        item = self.create_item()
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=2),
            rent_status=RentStatus.RETURNED
        )

        self.client.force_authenticate(user=self.renter)
        response = self.client.put(f"/rentas/full/{rent.id}/cancel_rent/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_has_rented_from_missing_params(self):
        self.client.force_authenticate(user=self.renter)
        response = self.client.get("/rentas/full/has-rented-from/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_closed_requests_missing_user(self):
        self.client.force_authenticate(user=self.renter)
        response = self.client.get("/rentas/full/closed-requests/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
