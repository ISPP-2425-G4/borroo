import pytest
from rest_framework.test import APIClient
from django.urls import reverse

from objetos.models import Item, ItemCategory


@pytest.mark.django_db
class TestSearchItemsView:
    @pytest.fixture
    def setup_items(self):

        return [
            Item.objects.create(
                title="Laptop Gamer",
                category=ItemCategory.TECHNOLOGY,
                price=1500,
            ),
            Item.objects.create(
                title="Balón de Fútbol",
                category=ItemCategory.SPORTS,
                price=50,
            ),
            Item.objects.create(
                title="Caja de Herramientas",
                category=ItemCategory.DIY,
                price=200,
            ),
            Item.objects.create(
                title="Camisa Casual",
                category=ItemCategory.CLOTHING,
                price=30,
            ),
            Item.objects.create(
                title="Escritorio de Oficina",
                category=ItemCategory.FURNITURE_AND_LOGISTICS,
                price=250,
            ),
            Item.objects.create(
                title="Curso de Programación",
                category=ItemCategory.TRAINING,
                price=500,
            ),
        ]

    # ------------------ Casos de prueba POSITIVOS ------------------

    def test_search_without_filters(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url)

        assert response.status_code == 200
        assert len(response.data["results"]) == 6

    def test_search_by_title(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"title": "Laptop"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_search_by_category(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"category": ItemCategory.SPORTS})

        assert response.status_code == 200
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["title"] == "Balón de Fútbol"

    def test_search_by_min_price(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"min_price": 300})

        assert response.status_code == 200
        assert len(response.data["results"]) == 2

    def test_search_by_max_price(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"max_price": 50})

        assert response.status_code == 200
        assert len(response.data["results"]) == 2

    def test_search_with_multiple_filters(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(
            url,
            {"title": "Curso", "min_price": 400, "max_price": 600},
        )

        assert response.status_code == 200
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["title"] == "Curso de Programación"

    # ------------------ Casos de prueba NEGATIVOS ------------------

    def test_search_no_results(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"title": "Televisor"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    def test_search_category_not_exist(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"category": "UNKNOWN_CATEGORY"})

        assert response.status_code == 400

    def test_search_min_price_higher_than_all(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"min_price": 2000})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    def test_search_max_price_lower_than_all(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"max_price": 10})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    # ------------------ Casos de prueba DESTRUCTIVOS ------------------

    def test_search_with_invalid_price_values(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"min_price": "abc", "max_price": "xyz"})

        assert response.status_code == 400
        assert "error" in response.data

    def test_search_with_special_characters(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"title": "!@#$%^&*()_+"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    def test_search_with_sql_injection_attempt(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(url, {"title": "'; DROP TABLE objetos_item; --"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    def test_search_with_extreme_values(self, setup_items):
        client = APIClient()
        url = reverse("search_item")

        response = client.get(
            url, {"min_price": -999999999, "max_price": 999999999})

        assert response.status_code == 200
        assert len(response.data["results"]) == 6
