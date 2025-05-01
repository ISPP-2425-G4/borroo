import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.hashers import make_password
from usuarios.models import User


@pytest.mark.django_db
class TestAdminUserEndpoints:
    @pytest.fixture
    def admin_user(self):
        return User.objects.create(
            username="adminuser",
            email="admin@example.com",
            password=make_password("AdminPassword123!"),
            is_admin=True
        )

    @pytest.fixture
    def regular_user(self):
        return User.objects.create(
            username="regularuser",
            email="regular@example.com",
            password=make_password("RegularPassword123!"),
            is_admin=False
        )

    @pytest.fixture
    def api_client(self):
        from rest_framework.test import APIClient
        return APIClient()

    def test_list_users_as_admin(self, api_client, admin_user):
        """Verifica que un administrador puede listar usuarios."""
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:list_users")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)

    def test_list_users_as_regular_user(self, api_client, regular_user):
        """Verifica que un usuario regular no puede listar usuarios."""
        api_client.force_authenticate(user=regular_user)
        url = reverse("app:list_users")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_user_as_admin(self, api_client, admin_user):
        """Verifica que un administrador puede crear un usuario."""
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:create_user")
        data = {
            "name": "New User",
            "surname": "Test",
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "NewPassword123!"
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username="newuser").exists()

    def test_create_user_as_regular_user(self, api_client, regular_user):
        """Verifica que un usuario regular no puede crear usuarios."""
        api_client.force_authenticate(user=regular_user)
        url = reverse("app:create_user")
        data = {
            "name": "New User",
            "surname": "Test",
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "NewPassword123!"
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_user_as_admin(self, api_client, admin_user, regular_user):
        """Verifica que un administrador puede actualizar un usuario."""
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:update_user", args=[regular_user.id])
        data = {"name": "Updated Name"}
        response = api_client.put(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        regular_user.refresh_from_db()
        assert regular_user.name == "Updated Name"

    def test_update_user_as_regular_user(self, api_client, regular_user):
        """Verifica que un usuario regular no puede actualizar usuarios."""
        api_client.force_authenticate(user=regular_user)
        url = reverse("app:update_user", args=[regular_user.id])
        data = {"name": "Updated Name"}
        response = api_client.put(url, data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_user_as_admin(self, api_client, admin_user, regular_user):
        """Verifica que un administrador puede eliminar un usuario."""
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:delete_user", args=[regular_user.id])
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not User.objects.filter(id=regular_user.id).exists()

    def test_delete_user_as_regular_user(self, api_client, regular_user):
        """Verifica que un usuario regular no puede eliminar usuarios."""
        api_client.force_authenticate(user=regular_user)
        url = reverse("app:delete_user", args=[regular_user.id])
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert User.objects.filter(id=regular_user.id).exists()
