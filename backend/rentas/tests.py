from datetime import datetime, timedelta
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
        item = Item.objects.create(title="Laptop", price=Decimal("50.0"),
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

    def test_rent_hour_valid_duration(self):
        item = Item.objects.create(
            title="Smartphone",
            price=Decimal("20.0"),
            price_category="hour",
            user=self.owner
        )
        start_date = timezone.now()
        end_date = start_date + timedelta(hours=20)  # (≤23 horas)
        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }
        response = self.client.post("/rentas/full/first_request/", rent_data,
                                    format="json")
        self.assertEqual(response.status_code, 201)

    def test_rent_hour_invalid_duration(self):
        item = Item.objects.create(
            title="Smartphone",
            price=Decimal("20.0"),
            price_category="hour",
            user=self.owner
        )
        start_date = timezone.now()
        end_date = start_date + timedelta(hours=24)  # >23h
        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }
        response = self.client.post("/rentas/full/first_request/", rent_data,
                                    format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.data)
        self.assertIn("no puede superar las 23 horas",
                      str(response.data["end_date"][0]))

    def test_rent_month_feb_valid(self):
        item = Item.objects.create(
            title="Equipo de sonido",
            price=Decimal("200.0"),
            price_category="month",
            user=self.owner
        )
        naive_start_date = datetime(2023, 2, 1, 10, 0)
        naive_end_date = datetime(2023, 2, 28, 10, 0)
        start_date = timezone.make_aware(naive_start_date)
        end_date = timezone.make_aware(naive_end_date)
        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }
        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")
        self.assertEqual(response.status_code, 201)

    def test_rent_month_feb_invalid(self):
        item = Item.objects.create(
            title="Equipo de sonido",
            price=Decimal("200.0"),
            price_category="month",
            user=self.owner
        )
        naive_start_date = datetime(2023, 2, 1, 10, 0)
        naive_end_date = datetime(2023, 3, 2, 10, 0)
        start_date = timezone.make_aware(naive_start_date)
        end_date = timezone.make_aware(naive_end_date)  # 30 dias
        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }
        response = self.client.post("/rentas/full/first_request/", rent_data,
                                    format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("febrero", str(response.data.get(
            "start_date", response.data.get("end_date", ""))))

    def test_rent_month_non_feb_valid(self):
        item = Item.objects.create(
            title="Proyecto de software",
            price=Decimal("300.0"),
            price_category="month",
            user=self.owner
        )
        naive_start_date = datetime(2023, 3, 1, 10, 0)
        naive_end_date = datetime(2023, 3, 31, 10, 0)
        start_date = timezone.make_aware(naive_start_date)
        end_date = timezone.make_aware(naive_end_date)
        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }
        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")
        self.assertEqual(response.status_code, 201)

    def test_rent_month_non_feb_invalid(self):
        item = Item.objects.create(
            title="Proyecto de software",
            price=Decimal("300.0"),
            price_category="month",
            user=self.owner
        )
        naive_start_date = datetime(2023, 3, 1, 10, 0)
        start_date = timezone.make_aware(naive_start_date)
        naive_end_date = datetime(2023, 3, 29, 10, 0)
        end_date = timezone.make_aware(naive_end_date)
        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "renter": self.renter.id
        }
        response = self.client.post("/rentas/full/first_request/", rent_data,
                                    format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("mes", str(response.data.get("end_date", "")))

    # ===============================
    # Pruebas para endpoints de cambios de estado y cancelacion
    # ===============================
    # 4. Endpoint respond_request: aceptar o rechazar solicitudes
    def test_respond_request_accepted(self):
        item = Item.objects.create(
            title="Tablet",
            price=Decimal("100.0"),
            price_category="day",
            user=self.owner
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=2),
            rent_status=RentStatus.REQUESTED
        )
        data = {
            "rent": rent.id,
            "response": "accepted",
            "user_id": self.owner.id
        }
        url = f"/rentas/full/{rent.id}/respond_request/"
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        rent.refresh_from_db()
        self.assertEqual(rent.rent_status, RentStatus.ACCEPTED)

    def test_respond_request_rejected(self):
        item = Item.objects.create(
            title="Tablet",
            price=Decimal("100.0"),
            price_category="day",
            user=self.owner
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=2),
            rent_status=RentStatus.REQUESTED
        )
        data = {
            "rent": rent.id,
            "response": "rejected",
            "user_id": self.owner.id
        }
        url = f"/rentas/full/{rent.id}/respond_request/"
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        rent.refresh_from_db()
        self.assertEqual(rent.rent_status, RentStatus.CANCELLED)

    def test_respond_request_invalid(self):
        item = Item.objects.create(
            title="Tablet",
            price=Decimal("100.0"),
            price_category="day",
            user=self.owner
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=2),
            rent_status=RentStatus.REQUESTED
        )
        data = {
            "rent": rent.id,
            "response": "invalid_response",
            "user_id": self.owner.id
        }
        url = f"/rentas/full/{rent.id}/respond_request/"
        response = self.client.put(url, data, format="json")
        # Se espera un error
        self.assertEqual(response.status_code, 403)

    # 5. Endpoint change_status: transición a PICKED_UP y RETURNED
    def test_change_status_picked_up_valid(self):
        start_date = timezone.now() - timedelta(minutes=5)
        end_date = timezone.now() + timedelta(days=1)
        item = Item.objects.create(
            title="Monitor",
            price=Decimal("80.0"),
            price_category="day",
            user=self.owner
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=start_date,
            end_date=end_date,
            rent_status=RentStatus.BOOKED,
            total_price=Decimal("100.0")
        )
        url = f"/rentas/full/{rent.id}/change_status/"
        data = {"response": "PICKED_UP"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        rent.refresh_from_db()
        expected_price = 86.0
        self.assertAlmostEqual(rent.total_price, expected_price, places=2)
        self.assertEqual(rent.rent_status, RentStatus.PICKED_UP)

    def test_change_status_picked_up_before_start(self):
        # start_date en el futuro: no se puede entregar el objeto
        start_date = timezone.now() + timedelta(minutes=10)
        end_date = timezone.now() + timedelta(days=1)
        item = Item.objects.create(
            title="Monitor",
            price=Decimal("80.0"),
            price_category="day",
            user=self.owner
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=start_date,
            end_date=end_date,
            rent_status=RentStatus.BOOKED,
            total_price=Decimal("100.0")
        )
        url = f"/rentas/full/{rent.id}/change_status/"
        data = {"response": "PICKED_UP"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Aún no es el día para entregar",
                      str(response.data.get("error", "")))

    # Para RETURNED:
    def test_change_status_returned_valid(self):
        # Solo puede devolver el owner.
        # end_date en el pasado para aplicar penalizacion
        start_date = timezone.now() - timedelta(days=2)
        end_date = timezone.now() - timedelta(days=1)
        item = Item.objects.create(
            title="Impresora",
            price=Decimal("150.0"),
            price_category="day",
            user=self.owner
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=start_date,
            end_date=end_date,
            rent_status=RentStatus.PICKED_UP,
            total_price=Decimal("200.0")
        )
        self.client.force_authenticate(user=self.owner)
        url = f"/rentas/full/{rent.id}/change_status/"
        data = {"response": "RETURNED"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        rent.refresh_from_db()

        expected_price = Decimal("161.25") * Decimal("1.10")
        self.assertAlmostEqual(float(rent.total_price),
                               float(expected_price),
                               places=2)
        self.assertEqual(rent.rent_status, RentStatus.RETURNED)

        self.client.force_authenticate(user=self.renter)

    def test_change_status_returned_before_start(self):
        start_date = timezone.now() + timedelta(hours=1)
        end_date = timezone.now() + timedelta(days=1)
        item = Item.objects.create(
            title="Impresora",
            price=Decimal("150.0"),
            price_category="day",
            user=self.owner
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=start_date,
            end_date=end_date,
            rent_status=RentStatus.PICKED_UP,
            total_price=Decimal("200.0")
        )
        self.client.force_authenticate(user=self.owner)
        url = f"/rentas/full/{rent.id}/change_status/"
        data = {"response": "RETURNED"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Aún no es el día para devolver",
                      str(response.data.get("error", "")))
        self.client.force_authenticate(user=self.renter)

    # 6. Endpoint cancel_rent
    def test_cancel_rent_requested(self):
        item = Item.objects.create(
            title="Cámara de video",
            price=Decimal("120.0"),
            price_category="day",
            user=self.owner,
            cancel_type="flexible"
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=3),
            rent_status=RentStatus.REQUESTED,
            total_price=Decimal("300.0")
        )
        url = f"/rentas/full/{rent.id}/cancel_rent/"
        response = self.client.put(url, {}, format="json")
        self.assertEqual(response.status_code, 200)
        rent.refresh_from_db()
        self.assertEqual(rent.rent_status, RentStatus.CANCELLED)

    def test_cancel_rent_booked(self):
        item = Item.objects.create(
            title="Cámara de video",
            price=Decimal("120.0"),
            price_category="day",
            user=self.owner,
            cancel_type="flexible"
        )
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now() + timedelta(days=5),
            end_date=timezone.now() + timedelta(days=7),
            rent_status=RentStatus.BOOKED
        )
        url = f"/rentas/full/{rent.id}/cancel_rent/"
        response = self.client.put(url, {}, format="json")
        self.assertEqual(response.status_code, 200)
        rent.refresh_from_db()
        self.assertEqual(rent.rent_status, RentStatus.CANCELLED)

    def test_cancel_rent_invalid_state(self):
        item = Item.objects.create(
            title="Cámara de video",
            price=Decimal("120.0"),
            price_category="day",
            user=self.owner,
            cancel_type="flexible"
        )
        # Un alquiler en estado PICKED_UP no se puede cancelar
        rent = Rent.objects.create(
            item=item,
            renter=self.renter,
            start_date=timezone.now() - timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1),
            rent_status=RentStatus.PICKED_UP,
            total_price=Decimal("300.0")
        )
        url = f"/rentas/full/{rent.id}/cancel_rent/"
        response = self.client.put(url, {}, format="json")
        self.assertEqual(response.status_code, 400)
