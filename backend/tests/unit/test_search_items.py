import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from django.urls import reverse
from objetos.models import ItemCategory


@pytest.mark.django_db
class TestSearchItemsView:
    @pytest.fixture
    def mock_items(self):
        items = [
            {"id": 1, "title": "Laptop Gamer",
             "category": ItemCategory.TECHNOLOGY, "price": 1500},
            {"id": 2, "title": "Balón de Fútbol",
             "category": ItemCategory.SPORTS, "price": 50},
            {"id": 3, "title": "Caja de Herramientas",
             "category": ItemCategory.DIY, "price": 200},
            {"id": 4, "title": "Camisa Casual",
             "category": ItemCategory.CLOTHING, "price": 30},
            {"id": 5, "title": "Escritorio de Oficina",
             "category": ItemCategory.FURNITURE_AND_LOGISTICS, "price": 250},
            {"id": 6, "title": "Curso de Programación",
             "category": ItemCategory.TRAINING, "price": 500},
        ]
        return items

    def mock_queryset(self, items):
        queryset = MagicMock()
        queryset.filter.return_value = queryset
        queryset.values.return_value = items
        return queryset

# CASOS POSITIVOS
    @patch("objetos.models.Item.objects.all")
    def test_search_without_filters(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        mock_all.return_value = self.mock_queryset(mock_items)

        response = client.get(url)

        assert response.status_code == 200
        assert len(response.data["results"]) == 6

    @patch("objetos.models.Item.objects.all")
    def test_search_by_title(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        filtered_items = [i for i in mock_items if "Laptop" in i["title"]]
        mock_all.return_value = self.mock_queryset(filtered_items)

        response = client.get(url, {"title": "Laptop"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    @patch("objetos.models.Item.objects.all")
    def test_search_by_category(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        filtered_items = [i for i in mock_items if i["category"] ==
                          ItemCategory.SPORTS]
        mock_all.return_value = self.mock_queryset(filtered_items)

        response = client.get(url, {"category": ItemCategory.SPORTS})

        assert response.status_code == 200
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["title"] == "Balón de Fútbol"

    @patch("objetos.models.Item.objects.all")
    def test_search_by_min_price(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        filtered_items = [i for i in mock_items if i["price"] >= 300]
        mock_all.return_value = self.mock_queryset(filtered_items)

        response = client.get(url, {"min_price": 300})

        assert response.status_code == 200
        assert len(response.data["results"]) == 2

    @patch("objetos.models.Item.objects.all")
    def test_search_by_max_price(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        filtered_items = [i for i in mock_items if i["price"] <= 50]
        mock_all.return_value = self.mock_queryset(filtered_items)

        response = client.get(url, {"max_price": 50})

        assert response.status_code == 200
        assert len(response.data["results"]) == 2

    @patch("objetos.models.Item.objects.all")
    def test_search_with_multiple_filters(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        filtered_items = [
            i for i in mock_items if "Curso" in i["title"]
            and 400 <= i["price"] <= 600
        ]
        mock_all.return_value = self.mock_queryset(filtered_items)

        response = client.get(url,
                              {"title": "Curso", "min_price": 400,
                               "max_price": 600})

        assert response.status_code == 200
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["title"] == "Curso de Programación"

# CASOS NEGATIVOS
    @patch("objetos.models.Item.objects.all")
    def test_search_no_results(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        mock_all.return_value = self.mock_queryset([])

        response = client.get(url, {"title": "Televisor"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    # @patch("objetos.models.Item.objects.all")
    # def test_search_category_not_exist(self, mock_all, mock_items):
    #     client = APIClient()
    #     url = reverse("cat_item")

    #     mock_all.return_value = self.mock_queryset([])

    #     response = client.get(url, {"category": "UNKNOWN_CATEGORY"})

    #     assert response.status_code == 400

    @patch("objetos.models.Item.objects.all")
    def test_search_min_price_higher_than_all(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        filtered_items = [i for i in mock_items if i["price"] >= 2000]
        mock_all.return_value = self.mock_queryset(filtered_items)

        response = client.get(url, {"min_price": 2000})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    @patch("objetos.models.Item.objects.all")
    def test_search_max_price_lower_than_all(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        filtered_items = [i for i in mock_items if i["price"] <= 10]
        mock_all.return_value = self.mock_queryset(filtered_items)

        response = client.get(url, {"max_price": 10})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    # @patch("objetos.models.Item.objects.all")
    # def test_search_with_invalid_price_values(self, mock_all, mock_items):
    #     client = APIClient()
    #     url = reverse("pri_item")

    #     response = client.get(url, {"min_price": "abc", "max_price": "xyz"})

    #     assert response.status_code == 400

# CASOS DESTRUCTIVOS
    @patch("objetos.models.Item.objects.all")
    def test_search_with_special_characters(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        mock_all.return_value = self.mock_queryset([])

        response = client.get(url, {"title": "!@#$%^&*()_+"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    @patch("objetos.models.Item.objects.all")
    def test_search_with_sql_injection_attempt(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        mock_all.return_value = self.mock_queryset([])

        response = client.get(url, {"title": "'; DROP TABLE objetos_item; --"})

        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    @patch("objetos.models.Item.objects.all")
    def test_search_with_extreme_values(self, mock_all, mock_items):
        client = APIClient()
        url = reverse("search_item")

        mock_all.return_value = self.mock_queryset(mock_items)

        response = client.get(url, {"min_price": -999999999,
                                    "max_price": 999999999})

        assert response.status_code == 200
        assert len(response.data["results"]) == 6
