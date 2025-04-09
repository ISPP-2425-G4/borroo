import pytest
from django.urls import reverse
from rest_framework import status
from django.test import Client
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient
from usuarios.models import User


@pytest.mark.django_db
class TestUserEndpoints:
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
    def api_client(self):
        return APIClient()

    def test_creacion_usuario(self, user_data):
        user = User.objects.create(**user_data)
        assert User.objects.count() == 1
        assert user.name == "Test User"
        assert user.username == "testuser"
        assert user.pricing_plan == "free"

    def test_lectura_usuario(self, client, create_user):
        client = Client()
        url = reverse('app:user-list')
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['username'] == "testuser"

    def test_lectura_detalle_usuario(self, client, create_user):
        client = Client()
        url = reverse('app:user-detail', args=[create_user.id])
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == "testuser"
        assert response.data['city'] == "Test City"

    def test_lectura_detalle_usuario_no_existente(self, client):
        url = reverse('app:user-detail', args=[999])
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_actualizacion_usuario_sin_actualizacion(
            self, api_client, create_user):
        """Test que verifica que un usuario
        no autenticado no puede actualizar datos"""
        updated_data = {
            "name": "Updated Name",
            "surname": "Updated Surname",
            "username": "updateduser",
            "phone_number": "+34638432345",
            "country": "Updated Country",
            "city": "Updated City",
            "address": "Updated Address",
            "postal_code": "67890",
            "is_verified": True,
            "pricing_plan": "premium"
        }
        url = reverse('app:user-detail', args=[create_user.id])
        response = api_client.put(url, data=updated_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_actualizacion_usuario_sin_autenticacion(
            self, client, create_user):
        """Test que verifica un usuario no autenticado no puede actualizar"""
        client = Client()
        updated_data = {
            "name": "Updated Name",
            "surname": "Updated Surname",
            "username": "updateduser",
            "phone_number": "+34638432345",
            "country": "Updated Country",
            "city": "Updated City",
            "address": "Updated Address",
            "postal_code": "67890",
            "is_verified": True,
            "verified_account": True,
            "pricing_plan": "premium"
        }
        url = reverse('app:user-detail', args=[create_user.id])
        response = client.put(
            url, data=updated_data, content_type='application/json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        create_user.refresh_from_db()
        assert create_user.name == "Test User"  # Verifica que no se actualizó

    def test_actualizacion_usuario_otro_usuario(self, api_client, create_user):
        """Test que verifica un usuario no
        puede actualizar datos de otro usuario"""
        # Crear otro usuario
        other_user = User.objects.create(
            username="otheruser",
            password=make_password("otherpassword"),
            email="other@test.com"
        )

        # Autenticar como el otro usuario
        api_client.force_authenticate(user=other_user)

        updated_data = {
            "name": "Updated Name",
            "surname": "Updated Surname",
            "username": "updateduser",
        }

        url = reverse('app:user-detail', args=[create_user.id])
        response = api_client.put(url, data=updated_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_eliminacion_usuario_sin_autenticacion(
            self, api_client, create_user):
        """Test que verifica que un usuario
        no autenticado no puede eliminar usuarios"""
        url = reverse('app:user-detail', args=[create_user.id])
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert User.objects.filter(id=create_user.id).exists()

    def test_eliminacion_usuario_otro_usuario(self, api_client, create_user):
        """Test que verifica que un usuario no puede eliminar a otro usuario"""
        other_user = User.objects.create(
            username="otheruser",
            password=make_password("otherpassword"),
            email="other@test.com"
        )

        api_client.force_authenticate(user=other_user)
        url = reverse('app:user-detail', args=[create_user.id])
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert User.objects.filter(id=create_user.id).exists()
