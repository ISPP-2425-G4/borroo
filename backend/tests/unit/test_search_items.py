import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from objetos.models import Item, ItemCategory, ItemSubcategory, CancelType
from objetos.models import PriceCategory
from usuarios.models import User
from django.contrib.auth.hashers import make_password


@pytest.mark.django_db
class TestSearchItemsView:

    @pytest.fixture
    def user(self):
        return User.objects.create(
            username="tester",
            password=make_password("testpass"),
            email="tester@example.com",
            name="Test",
            surname="Tester",
            phone_number="+34000000000",
            country="España",
            city="Madrid",
            address="Calle Prueba 123",
            postal_code="28000",
            is_verified=True,
            pricing_plan="free"
        )

    @pytest.fixture
    def items(self, user):
        return [
            Item.objects.create(
                title="Laptop Gamer",
                description="Alta gama",
                category=ItemCategory.TECHNOLOGY,
                subcategory=ItemSubcategory.COMPUTERS,
                cancel_type=CancelType.FLEXIBLE,
                price_category=PriceCategory.DAY,
                price=1500,
                user=user
            ),
            Item.objects.create(
                title="Balón de Fútbol",
                description="Tamaño oficial",
                category=ItemCategory.SPORTS,
                subcategory=ItemSubcategory.BALL_SPORTS,
                cancel_type=CancelType.FLEXIBLE,
                price_category=PriceCategory.DAY,
                price=50,
                user=user
            ),
            Item.objects.create(
                title="Caja de Herramientas",
                description="Para bricolaje",
                category=ItemCategory.DIY,
                subcategory=ItemSubcategory.MANUAL_TOOLS,
                cancel_type=CancelType.FLEXIBLE,
                price_category=PriceCategory.DAY,
                price=200,
                user=user
            ),
            Item.objects.create(
                title="Camisa Casual",
                description="Verano",
                category=ItemCategory.CLOTHING,
                subcategory=ItemSubcategory.SUMMER_CLOTHING,
                cancel_type=CancelType.FLEXIBLE,
                price_category=PriceCategory.DAY,
                price=30,
                user=user
            ),
            Item.objects.create(
                title="Escritorio de Oficina",
                description="Moderno",
                category=ItemCategory.FURNITURE_AND_LOGISTICS,
                subcategory=ItemSubcategory.HOME_FURNITURE,
                cancel_type=CancelType.FLEXIBLE,
                price_category=PriceCategory.DAY,
                price=250,
                user=user
            ),
            Item.objects.create(
                title="Curso de Programación",
                description="Python intensivo",
                category=ItemCategory.ENTERTAINMENT,
                subcategory=ItemSubcategory.BOOKS,
                cancel_type=CancelType.FLEXIBLE,
                price_category=PriceCategory.DAY,
                price=500,
                user=user
            )
        ]

    # ✅ CASOS POSITIVOS
    def test_search_without_filters(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url)

        assert response.status_code == 200
        assert len(response.data["results"]) == 6

    def test_search_by_title(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"title": "Laptop"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["title"] == "Laptop Gamer"

    def test_search_by_category(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"category": ItemCategory.SPORTS})

        assert response.status_code == 200
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["title"] == "Balón de Fútbol"

    def test_search_by_min_price(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"min_price": 300})

        assert response.status_code == 200
        assert len(response.data["results"]) == 2  # Laptop + Curso

    def test_search_by_max_price(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"max_price": 50})

        assert response.status_code == 200
        assert len(response.data["results"]) == 2  # Balón + Camisa

    def test_search_with_multiple_filters(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {
            "title": "Curso",
            "min_price": 400,
            "max_price": 600
        })

        assert response.status_code == 200
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["title"] == "Curso de Programación"

    # ❌ CASOS NEGATIVOS
    def test_search_no_results(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"title": "Televisor"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    def test_search_min_price_higher_than_all(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"min_price": 2000})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    def test_search_max_price_lower_than_all(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"max_price": 10})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    # 💣 CASOS DESTRUCTIVOS
    def test_search_with_special_characters(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"title": "!@#$%^&*()_+"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    def test_search_with_sql_injection_attempt(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"title": "'; DROP TABLE objetos_item; --"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    def test_search_with_extreme_values(self, items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {
            "min_price": -999999999,
            "max_price": 999999999
        })

        assert response.status_code == 200
        assert len(response.data["results"]) == 6

    def test_search_with_invalid_price_values(self):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"min_price": "abc", "max_price": "xyz"})

        assert response.status_code == 400
        assert "error" in response.data
