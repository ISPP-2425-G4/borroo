import pytest
from rest_framework.test import APIClient
from rest_framework import status
from usuarios.models import User
from django.urls import reverse


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestRegisterEndpoint:
    @pytest.fixture
    def valid_user_data(self):
        return {
            "name": "Test",
            "surname": "User",
            "username": "testuser",
            "email": "test@example.com",
            "password": "Password123!",
            "dni": "12345678A"
        }

    def test_register_successful(self, api_client, valid_user_data):
        url = reverse('app:user-list')
        response = api_client.post(url, valid_user_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(
            username=valid_user_data["username"]).exists()
        user = User.objects.get(username=valid_user_data["username"])
        assert user.name == valid_user_data["name"]
        assert user.surname == valid_user_data["surname"]
        assert user.email == valid_user_data["email"]

    def test_register_invalid_password(self, api_client, valid_user_data):
        url = reverse('app:user-list')
        invalid_passwords = [
            "short",
            "lowercase123!",
            "UPPERCASE123!",
            "Password!!!",
            "Password123"
        ]
        for invalid_pass in invalid_passwords:
            data = valid_user_data.copy()
            data["password"] = invalid_pass
            response = api_client.post(url, data, format='json')
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert "password" in response.data["details"]

    def test_register_invalid_name_surname(self, api_client, valid_user_data):
        url = reverse('app:user-list')

        data = valid_user_data.copy()
        data["name"] = "123Test"
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "name" in response.data["details"]

        data = valid_user_data.copy()
        data["surname"] = "!User"
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "surname" in response.data["details"]

    def test_register_optional_cif(self, api_client, valid_user_data):
        url = reverse('app:user-list')

        data = valid_user_data.copy()
        data["username"] = "testuser2"
        data["email"] = "test2@example.com"
        data["dni"] = "87654321B"
        data["cif"] = "B12345678"
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED

        data = valid_user_data.copy()
        data["username"] = "testuser3"
        data["email"] = "test3@example.com"
        data["dni"] = "76543210C"
        data["cif"] = ""
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "cif" in response.data["details"]

    def test_register_required_fields(self, api_client, valid_user_data):
        url = reverse('app:user-list')
        required_fields = [
            'name', 'surname', 'username', 'email', 'password']

        for field in required_fields:
            data = valid_user_data.copy()
            data.pop(field)
            response = api_client.post(url, data, format='json')
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert field in response.data["details"]
