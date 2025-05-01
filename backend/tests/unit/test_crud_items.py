import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from usuarios.models import User
from objetos.models import Item
from django.contrib.auth.hashers import make_password


@pytest.mark.django_db
class TestItemEndpoints:
    @pytest.fixture
    def user_data(self):
        return {
            "name": "Test User",
            "surname": "Normal",
            "username": "testuser",
            "email": "testuser@example.com",
            "phone_number": "+34678432345",
            "country": "Test Country",
            "city": "Test City",
            "address": "Test Address",
            "postal_code": "12345",
            "dni": "12345678A",
            "is_verified": True,
            "verified_account": True,
            "pricing_plan": "free",
            "password": make_password("Password123!")
        }

    @pytest.fixture
    def create_user(self, user_data):
        return User.objects.create(**user_data)

    @pytest.fixture
    def create_item(self, create_user):
        return Item.objects.create(
            title="Test Item",
            description="Test Description",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=25.50,
            deposit=10.00,
            user=create_user,
            draft_mode=False
        )

    @pytest.fixture
    def auth_client(self):
        return APIClient()

    @pytest.fixture
    def authenticated_client(self, auth_client, create_user):
        url = reverse('app:user-login')
        data = {
            "usernameOrEmail": "testuser",
            "password": "Password123!"
        }
        response = auth_client.post(url, data, format='json')
        assert response.status_code == 200
        token = response.data["access"]
        auth_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return auth_client

    def test_lectura_lista_items(self, auth_client, create_item):
        url = reverse('item-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_lectura_detalle_item(self, auth_client, create_item):
        url = reverse('item-detail', args=[create_item.id])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == "Test Item"

    def test_eliminacion_item(
            self, authenticated_client, create_user, create_item):
        url = reverse('item-detail', args=[create_item.id])
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Item.objects.count() == 0

    def test_eliminacion_item_sin_autenticacion(
            self, auth_client, create_item):
        url = reverse('item-detail', args=[create_item.id])
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert Item.objects.filter(id=create_item.id).exists()

    def test_lectura_detalle_item_no_existente(self, auth_client):
        url = reverse('item-detail', args=[999])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_actualizacion_item_exitosa(
            self, authenticated_client, create_item):
        """Test que verifica la actualización exitosa de un item"""
        url = reverse('item-detail', args=[create_item.id])
        updated_data = {
            "title": "Updated Title",
            "description": "Updated Description",
            "category": "technology",
            "subcategory": "computers",
            "cancel_type": "flexible",
            "price_category": "day",
            "price": 35.50,
            "deposit": 15.00,
            "draft_mode": True
        }
        response = authenticated_client.patch(
            url, data=updated_data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == "Updated Title"
        assert float(response.data['price']) == 35.50

        updated_item = Item.objects.get(id=create_item.id)
        assert updated_item.title == "Updated Title"
        assert float(updated_item.price) == 35.50

    def test_actualizacion_item_sin_autenticacion(
            self, auth_client, create_item):
        """Test que verifica que un usuario no
        autenticado no puede actualizar items"""
        url = reverse('item-detail', args=[create_item.id])
        updated_data = {
            "title": "Updated Title",
            "description": "Updated Description"
        }
        response = auth_client.patch(url, data=updated_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        item = Item.objects.get(id=create_item.id)
        assert item.title == "Test Item"

    def test_actualizacion_item_otro_usuario(
            self, authenticated_client, create_item):
        """Test que verifica que un usuario no
        puede actualizar items de otro usuario"""

        other_user = User.objects.create(
            username="otheruser",
            password=make_password("Password123!"),
            email="other@test.com",
            name="Other",
            surname="User",
            verified_account=True
        )

        other_item = Item.objects.create(
            title="Other Item",
            description="Other Description",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=25.50,
            deposit=10.00,
            user=other_user,
            draft_mode=False
        )

        url = reverse('item-detail', args=[other_item.id])
        updated_data = {
            "title": "Updated Title",
            "description": "Updated Description"
        }
        response = authenticated_client.patch(url, data=updated_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        item = Item.objects.get(id=other_item.id)
        assert item.title == "Other Item"

    def test_eliminacion_item_otro_usuario(
            self, authenticated_client, create_item):
        """Test que verifica que un usuario no
        puede eliminar items de otro usuario"""

        other_user = User.objects.create(
            username="otheruser",
            password=make_password("Password123!"),
            email="other@test.com",
            name="Other",
            surname="User",
            verified_account=True
        )

        other_item = Item.objects.create(
            title="Other Item",
            description="Other Description",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=25.50,
            deposit=10.00,
            user=other_user,
            draft_mode=False
        )

        url = reverse('item-detail', args=[other_item.id])
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Item.objects.filter(id=other_item.id).exists()

    def test_actualizacion_item_datos_invalidos(
            self, authenticated_client, create_item):
        """Test que verifica la validación de datos en la actualización"""
        url = reverse('item-detail', args=[create_item.id])
        invalid_data = {
            "price": -50.00,
            "deposit": -10.00
        }
        response = authenticated_client.patch(url, data=invalid_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        item = Item.objects.get(id=create_item.id)
        assert float(item.price) == 25.50

    def test_creacion_item_exitosa(self, authenticated_client, create_user):
        """Test que verifica la creación exitosa de un item"""
        url = reverse('item-list')
        item_data = {
            "title": "New Item",
            "description": "New Description",
            "category": "technology",
            "cancel_type": "flexible",
            "price_category": "day",
            "price": 30.00,
            "deposit": 12.00,
            "draft_mode": True
        }
        response = authenticated_client.post(url, data=item_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == "New Item"
        assert Item.objects.count() == 1

    def test_creacion_item_sin_autenticacion(self, auth_client):
        """Test que verifica que un usuario
        no autenticado no puede crear items"""
        url = reverse('item-list')
        item_data = {
            "title": "New Item",
            "description": "New Description",
            "category": "technology",
            "cancel_type": "flexible",
            "price_category": "day",
            "price": 30.00,
            "deposit": 12.00
        }
        response = auth_client.post(url, data=item_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert Item.objects.count() == 0
