import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth.hashers import make_password
from usuarios.models import User
from objetos.models import ItemCategory, CancelType, ItemSubcategory, PriceCategory


@pytest.mark.django_db
class TestCreateItemRequest:

    @pytest.fixture
    def user(self):
        return User.objects.create(
            username="testuser",
            password=make_password("testpass"),
            email="testuser@example.com",
            name="Test",
            surname="User",
            phone_number="+34678432345",
            country="España",
            city="Madrid",
            address="Calle Falsa 123",
            postal_code="28080",
            is_verified=True,
            pricing_plan="free"
        )

    # ✅ CASOS POSITIVOS
    def test_create_valid_item_request(self, user):
        client = APIClient()
        url = reverse("create_item_request")

        data = {
            "title": "Alquilar bicicleta",
            "description": "Busco bici por 3 días",
            "category": ItemCategory.SPORTS,
            "subcategory": ItemSubcategory.CYCLING,
            "cancel_type": CancelType.FLEXIBLE,
            "price_category": PriceCategory.DAY,
            "price": "10.00",
            "user": user.id
        }

        response = client.post(url, data, format="json")
        print(response.data)

        assert response.status_code == 201
        assert response.data["item_request"]["title"] == "Alquilar bicicleta"
        assert response.data["item_request"]["approved"] is False

    # ❌ CASOS NEGATIVOS
    def test_create_item_request_missing_title(self, user):
        client = APIClient()
        url = reverse("create_item_request")

        data = {
            "description": "Falta título",
            "category": ItemCategory.SPORTS,
            "subcategory": ItemSubcategory.GYM,
            "cancel_type": CancelType.FLEXIBLE,
            "price_category": PriceCategory.DAY,
            "price": "20.00",
            "user": user.id
        }

        response = client.post(url, data, format="json")

        assert response.status_code == 400
        assert "title" in response.data

    def test_create_item_request_invalid_price(self, user):
        client = APIClient()
        url = reverse("create_item_request")

        data = {
            "title": "Objeto con precio negativo",
            "description": "Esto debería fallar",
            "category": ItemCategory.TECHNOLOGY,
            "subcategory": ItemSubcategory.COMPUTERS,
            "cancel_type": CancelType.MEDIUM,
            "price_category": PriceCategory.DAY,
            "price": "-5.00",
            "user": user.id
        }

        response = client.post(url, data, format="json")

        assert response.status_code == 400
        assert "price" in response.data

    def test_create_item_request_user_not_exist(self):
        client = APIClient()
        url = reverse("create_item_request")

        data = {
            "title": "Usuario no válido",
            "description": "Usuario que no existe",
            "category": ItemCategory.ENTERTAINMENT,
            "subcategory": ItemSubcategory.BOARD_GAMES,
            "cancel_type": CancelType.STRICT,
            "price_category": PriceCategory.DAY,
            "price": "30.00",
            "user": 9999
        }

        response = client.post(url, data, format="json")

        assert response.status_code == 400

    # 🧨 CASOS DESTRUCTIVOS
    def test_create_item_request_with_script_injection(self, user):
        client = APIClient()
        url = reverse("create_item_request")

        data = {
            "title": "<script>alert('XSS')</script>",
            "description": "Intento de inyección",
            "category": ItemCategory.DIY,
            "subcategory": ItemSubcategory.MANUAL_TOOLS,
            "cancel_type": CancelType.MEDIUM,
            "price_category": PriceCategory.DAY,
            "price": "50.00",
            "user": user.id
        }

        response = client.post(url, data, format="json")
        print(response.data)

        assert response.status_code == 201
        assert "<script>" in response.data["item_request"]["title"]

    def test_create_item_request_sql_injection(self, user):
        client = APIClient()
        url = reverse("create_item_request")

        data = {
            "title": "'; DROP TABLE objetos_itemrequest; --",
            "description": "Intento SQL",
            "category": ItemCategory.CLOTHING,
            "subcategory": ItemSubcategory.DRESSES,
            "cancel_type": CancelType.STRICT,
            "price_category": PriceCategory.DAY,
            "price": "70.00",
            "user": user.id
        }

        response = client.post(url, data, format="json")
        print(response.data)

        assert response.status_code == 201
        assert "DROP TABLE" in response.data["item_request"]["title"]

    def test_create_item_request_extreme_price_value(self, user):
        client = APIClient()
        url = reverse("create_item_request")

        data = {
            "title": "Precio extremo",
            "description": "Precio fuera de rango",
            "category": ItemCategory.FURNITURE_AND_LOGISTICS,
            "subcategory": ItemSubcategory.HOME_FURNITURE,
            "cancel_type": CancelType.FLEXIBLE,
            "price_category": PriceCategory.DAY,
            "price": "999999999",
            "user": user.id
        }

        response = client.post(url, data, format="json")

        assert response.status_code == 400
        assert "price" in response.data
