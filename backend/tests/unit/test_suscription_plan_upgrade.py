import pytest
from django.urls import reverse
from rest_framework import status
from usuarios.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestPricingPlanEndpoints:
    @pytest.fixture
    def free_user_data(self):
        return {
            "name": "Free User",
            "surname": "Normal",
            "username": "freeuser",
            "email": "freeuser@example.com",
            "phone_number": "+34678432345",
            "country": "Test Country",
            "city": "Test City",
            "address": "Test Address",
            "postal_code": "12345",
            "is_verified": True,
            "pricing_plan": "free",
            "password": make_password("Password123!")
        }

    @pytest.fixture
    def premium_user_data(self):
        return {
            "name": "Premium User",
            "surname": "Special",
            "username": "premiumuser",
            "email": "premiumuser@example.com",
            "phone_number": "+34678432346",
            "country": "Test Country",
            "city": "Test City",
            "address": "Test Address",
            "postal_code": "12345",
            "is_verified": True,
            "pricing_plan": "premium",
            "password": make_password("Password123!")
        }

    @pytest.fixture
    def create_free_user(self, free_user_data):
        return User.objects.create(**free_user_data)

    @pytest.fixture
    def create_premium_user(self, premium_user_data):
        return User.objects.create(**premium_user_data)

    @pytest.fixture
    def auth_client(self):
        return APIClient()

    @pytest.fixture
    def authenticated_free_user_client(
            self, auth_client, create_free_user):
        # Usamos el endpoint de login para obtener el token
        url = reverse('app:user-login')
        data = {
            "username": "freeuser",
            "password": "Password123!"
        }
        response = auth_client.post(url, data, format='json')
        token = response.data["access"]
        auth_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return auth_client

    @pytest.fixture
    def authenticated_premium_user_client(
            self, auth_client, create_premium_user):
        # Usamos el endpoint de login para obtener el token
        url = reverse('app:user-login')
        data = {
            "username": "premiumuser",
            "password": "Password123!"
        }
        response = auth_client.post(url, data, format='json')
        token = response.data["access"]
        auth_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return auth_client

    def test_upgrade_to_premium_success(
            self, authenticated_free_user_client, create_free_user):
        url = reverse('app:user-upgrade-to-premium',
                      args=[create_free_user.id])
        response = authenticated_free_user_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Plan actualizado a premium."

        create_free_user.refresh_from_db()
        assert create_free_user.pricing_plan == "premium"

    def test_upgrade_to_premium_failure_already_premium(
            self, authenticated_premium_user_client, create_premium_user):
        url = reverse('app:user-upgrade-to-premium',
                      args=[create_premium_user.id])
        response = authenticated_premium_user_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

        create_premium_user.refresh_from_db()
        assert create_premium_user.pricing_plan == "premium"

    def test_downgrade_to_free_success(
            self, authenticated_premium_user_client, create_premium_user):
        url = reverse('app:user-downgrade-to-free',
                      args=[create_premium_user.id])
        response = authenticated_premium_user_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Plan actualizado a free."

        create_premium_user.refresh_from_db()
        assert create_premium_user.pricing_plan == "free"

    def test_downgrade_to_free_failure_already_free(
            self, authenticated_free_user_client, create_free_user):
        url = reverse('app:user-downgrade-to-free', args=[create_free_user.id])
        response = authenticated_free_user_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        create_free_user.refresh_from_db()
        assert create_free_user.pricing_plan == "free"

    def test_upgrade_unauthorized(self, auth_client, create_free_user):
        url = reverse('app:user-upgrade-to-premium',
                      args=[create_free_user.id])
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_downgrade_unauthorized(self, auth_client, create_premium_user):
        url = reverse('app:user-downgrade-to-free',
                      args=[create_premium_user.id])
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
