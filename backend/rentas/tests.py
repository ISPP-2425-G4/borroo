from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from objetos.models import Item
from rentas.models import Rent, RentStatus
from decimal import Decimal
from usuarios.models import User


class RentTests(TestCase):
    def setUp(self):
        """ Configuración inicial antes de cada test """
        self.client = APIClient()
        self.user = User.objects.create(
            username="testuser",
            password="testpassword",
            email="testuser@example.com",
            name="Test",
            surname="User",
            phone_number="123456789",
            country="Country",
            city="City",
            address="Test Address",
            postal_code="12345",
            is_verified=True,
            pricing_plan="free"
        )
        self.client.force_authenticate(user=self.user)

    def test_take_rent(self):
        """ Prueba realizar un alquiler correctamente """
        item = Item.objects.create(title="Laptop",
                                   price=50.0, price_category="day")

        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=3)

        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }

        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")

        self.assertEqual(response.status_code, 201)
        rent = Rent.objects.get(item=item, renter=self.user)
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
        """ Prueba intentar alquilar con fechas inválidas """
        item = Item.objects.create(title="Bicicleta",
                                   price=30.0, price_category="day")

        start_date = timezone.now()
        end_date = start_date  # Fecha de fin igual a la de inicio

        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }

        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.data)
        self.assertIn("posterior", str(response.data["end_date"][0]))

    def test_rent_non_existent_item(self):
        """ Prueba intentar alquilar un objeto que no existe """
        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=3)

        rent_data = {
            "item": 9999,  # ID de un objeto que no existe
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }

        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("item", response.data)

    def test_rent_overlapping_dates(self):
        """ Prueba intentar alquilar un objeto ya
        reservado en las mismas fechas """
        item = Item.objects.create(title="Proyector",
                                   price=Decimal("80.0"), price_category="day")

        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=2)

        Rent.objects.create(item=item, renter=self.user, start_date=start_date,
                            end_date=end_date,
                            rent_status=RentStatus.REQUESTED)

        rent_data = {
            "item": item.id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }

        response = self.client.post("/rentas/full/first_request/",
                                    rent_data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)
        expected_error = "El objeto no está disponible en esas fechas"
        self.assertEqual(response.data["error"], expected_error)
