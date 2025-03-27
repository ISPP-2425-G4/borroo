import pytest
import uuid
from django.urls import reverse
from django.core import mail
from django.utils.timezone import now
from rest_framework import status
from rest_framework.test import APIClient
from usuarios.models import User
from datetime import timedelta


@pytest.mark.django_db
class TestPasswordResetEndpoints:
    @pytest.fixture
    def user_data(self):
        return {
            "name": "Test User",
            "surname": "Lastname",
            "username": "testuser",
            "email": "testuser@example.com",
            "phone_number": "+34678432345",
            "country": "Test Country",
            "city": "Test City",
            "address": "Test Address",
            "postal_code": "12345",
            "is_verified": True,
            "password": "Password123!"
        }

    @pytest.fixture
    def create_user(self, user_data):
        return User.objects.create(**user_data)

    @pytest.fixture
    def auth_client(self):
        return APIClient()

    def test_password_reset_request_success(self, auth_client, create_user):
        url = reverse("app:password_reset")
        data = {"email": create_user.email}
        response = auth_client.post(url, data, format="json")

        create_user.refresh_from_db()

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Correo de recuperación enviado"
        assert create_user.reset_token is not None
        assert create_user.reset_token_expiration is not None
        assert len(mail.outbox) == 1
        assert create_user.email in mail.outbox[0].to

    def test_password_reset_request_failure_invalid_email(self, auth_client):
        url = reverse("app:password_reset")
        data = {"email": "invalid@example.com"}
        response = auth_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data[
            "error"] == "No se encontró un usuario con ese email."

    def test_password_reset_confirm_success(self, auth_client, create_user):
        reset_token = str(uuid.uuid4())
        create_user.reset_token = reset_token
        create_user.reset_token_expiration = now() + timedelta(minutes=10)
        create_user.save()

        url = reverse("app:password_reset_confirm",
                      kwargs={"token": reset_token})
        data = {"password": "NewPassword123!"}
        response = auth_client.post(url, data, format="json")

        print("Response status:", response.status_code)
        print("Response data:", response.data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data[
            "message"] == "Contraseña actualizada correctamente"

    def test_password_reset_confirm_failure_invalid_token(
            self, auth_client, create_user):
        url = reverse("app:password_reset_confirm",
                      kwargs={"token": "invalid-token"})
        data = {"token": "invalid-token", "new_password": "NewPassword123!"}
        response = auth_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"].strip() == "Token inválido o expirado"
