import pytest
from django.urls import reverse
from rest_framework import status
from usuarios.models import User
from objetos.models import Item, ItemCategory, CancelType, PriceCategory
from django.contrib.auth.hashers import make_password


@pytest.mark.django_db
class TestItemEndpoints:
    @pytest.fixture
    def user_data(self):
        return {
            "name": "Test User",
            "surname": "Normal",
            "username": "testuser",
            "email": "testuser_1@example.com",
            "phone_number": "+34678432345",
            "country": "Test Country",
            "city": "Test City",
            "address": "Test Address",
            "postal_code": "12345",
            "is_verified": True,
            "pricing_plan": "free",
            "password": make_password("password123")
        }

    @pytest.fixture
    def create_user(self, user_data):
        return User.objects.create(**user_data)

    @pytest.fixture
    def item_data(self, create_user):
        return {
            "title": "Laptop Gamer",
            "description": "Una laptop potente para gaming.",
            "category": ItemCategory.TECHNOLOGY,
            "cancel_type": CancelType.FLEXIBLE,
            "price_category": PriceCategory.DAY,
            "price": 1500.00,
            "user": create_user,
        }

    @pytest.fixture
    def create_item(self, item_data):
        return Item.objects.create(**item_data)

    @pytest.fixture
    def itemImage_data(self, create_item):
        return {
            "item": create_item,
            "image": "../../../fronted/public/logo.png",
        }

    @pytest.fixture
    def create_itemImage(self, itemImage_data):
        return Item.objects.create(**itemImage_data)

    # Casos positivos
    def test_creacion_item(self, item_data):
        item = Item.objects.create(**item_data)
        assert Item.objects.count() == 1
        assert item.title == "Laptop Gamer"
        assert item.category == ItemCategory.TECHNOLOGY

    def test_lectura_lista_items(self, client, create_item):
        url = reverse('item-list')
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == "Laptop Gamer"

    def test_lectura_detalle_item(self, client, create_item):
        url = reverse('item-detail', args=[create_item.id])
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == "Laptop Gamer"
        assert response.data[
            'description'] == "Una laptop potente para gaming."

    # def test_actualizacion_item(self, client, create_user, create_item):
    #     url = reverse('item-detail', args=[create_item.id])

    #     updated_data = {
    #         "title": "Laptop Gamer Pro",
    #         "description": "Una laptop aún más potente para gaming.",
    #         "category": ItemCategory.TECHNOLOGY,
    #         "cancel_type": CancelType.FLEXIBLE,
    #         "price_category": PriceCategory.DAY,
    #         "price": 2000.00,
    #         "user": create_user.id,
    #     }

    #     response = client.put(url, data=updated_data,
    #                           content_type='application/json')
    #     assert response.status_code == status.HTTP_200_OK

    #     create_item.refresh_from_db()
    #     assert create_item.title == "Laptop Gamer Pro"
    #     assert create_item.price == 2000.00

    def test_eliminacion_item(self, client, create_user, create_item):
        url = reverse('item-detail', args=[create_item.id])
        response = client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Item.objects.count() == 0

    def test_lectura_detalle_item_no_existente(self, client):
        url = reverse('item-detail', args=[999])
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
