import pytest
from django.urls import reverse
from rest_framework import status
from usuarios.models import User
from django.contrib.auth.hashers import make_password


@pytest.mark.django_db
class TestLoginEndpoint:
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
            "verified_account": True,
            "pricing_plan": "free",
            "password": make_password("Password123!")
        }

    @pytest.fixture
    def create_user(self, user_data):
        return User.objects.create(**user_data)

    def test_login_successful(self, client, create_user):
        url = reverse('app:user-login')
        data = {
            "usernameOrEmail": "testuser",
            "password": "Password123!"
        }
        response = client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert "user" in response.data
        assert "refresh" in response.data
        assert "access" in response.data
        assert response.data["user"]["username"] == "testuser"

    def test_login_missing_credentials(self, client):
        url = reverse('app:user-login')
        # Caso 1: Falta username
        data = {"password": "Password123!"}
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert response.data["error"] == "Se requiere usuario y contraseña"

        # Caso 2: Falta password
        data = {"username": "testuser"}
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert response.data["error"] == "Se requiere usuario y contraseña"

        # Caso 3: Faltan ambos
        data = {}
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert response.data["error"] == "Se requiere usuario y contraseña"

    def test_login_user_not_found(self, client):
        url = reverse('app:user-login')
        data = {
            "usernameOrEmail": "nonexistent",
            "password": "Password123!"
        }
        response = client.post(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "error" in response.data
        assert response.data["error"] == "Usuario no encontrado"

    def test_login_wrong_password(self, client, create_user):
        url = reverse('app:user-login')
        data = {
            "usernameOrEmail": "testuser",
            "password": "WrongPassword123!"
        }
        response = client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "error" in response.data
        assert response.data["error"] == "Credenciales incorrectas"
