import pytest
from django.urls import reverse
from rest_framework import status
from django.test import Client
from usuarios.models import User
from django.contrib.auth.hashers import make_password


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

    def test_actualizacion_usuario_sin_actualizacion(self,
                                                     client, create_user):
        client = Client()
        client.login(username='testuser', password='password')
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
        response = client.put(url, data=updated_data,
                              content_type='application/json')
        assert response.status_code == status.HTTP_403_FORBIDDEN
        # create_user.refresh_from_db()
        # assert create_user.name == "Updated Name"
        # assert create_user.city == "Updated City"
        # assert create_user.pricing_plan == "premium"

    def test_eliminacion_usuario_sin_autenticacion(self, client, create_user):
        client = Client()
        client.login(username='testuser', password='password123')
        url = reverse('app:user-detail', args=[create_user.id])
        response = client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        # assert User.objects.count() == 0
