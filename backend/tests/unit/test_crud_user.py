import pytest
from django.urls import reverse
from rest_framework import status
from django.test import Client
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient
from usuarios.models import User
from usuarios.serializers import UserSerializer


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
        assert create_user.name == "Test User"

    def test_actualizacion_usuario_otro_usuario(self, api_client, create_user):
        """Test que verifica un usuario no
        puede actualizar datos de otro usuario"""

        other_user = User.objects.create(
            username="otheruser",
            password=make_password("otherpassword"),
            email="other@test.com"
        )

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

    def test_actualizacion_usuario_exitosa(self, api_client, create_user):
        """Test que verifica la actualización
        exitosa de un usuario autenticado"""
        api_client.force_authenticate(user=create_user)
        url = reverse('app:user-detail', args=[create_user.id])

        updated_data = {
            "name": "Updated Name",
            "surname": "Updated Surname",
            "phone_number": "+34638432345",
            "country": "Updated Country",
            "city": "Updated City",
            "address": "Updated Address",
            "postal_code": "67890",
            "dni": "12345678A"
        }

        response = api_client.patch(url, data=updated_data)
        assert response.status_code == status.HTTP_200_OK
        create_user.refresh_from_db()
        assert create_user.name == "Updated Name"
        assert create_user.city == "Updated City"

    def test_actualizacion_datos_invalidos(self, api_client, create_user):
        """Test que verifica el rechazo de datos
        inválidos en la actualización"""
        api_client.force_authenticate(user=create_user)
        url = reverse('app:user-detail', args=[create_user.id])

        invalid_data = {
            "phone_number": "invalid_phone",
            "postal_code": "invalid_code",
            "dni": "invalid_dni"
        }

        response = api_client.patch(url, data=invalid_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        create_user.refresh_from_db()
        assert create_user.phone_number == "+34678432345"

    def test_creacion_usuario_datos_duplicados(self, create_user):
        """Test que verifica el rechazo de
        usuario con datos únicos duplicados"""
        duplicate_user_data = {
            "name": "Another User",
            "surname": "Test",
            "username": "testuser",
            "email": "testuser_1@example.com",
            "password": make_password("password123"),
            "phone_number": "+34678432345",
            "country": "Test Country",
            "city": "Test City"
        }

        serializer = UserSerializer(data=duplicate_user_data)
        assert not serializer.is_valid()
        assert 'username' in serializer.errors
        assert 'email' in serializer.errors

    def test_eliminacion_usuario_exitosa(self, api_client, create_user):
        """Test que verifica la eliminación exitosa de un usuario"""
        api_client.force_authenticate(user=create_user)
        url = reverse('app:user-detail', args=[create_user.id])

        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not User.objects.filter(id=create_user.id).exists()

    def test_creacion_usuario_campos_requeridos(self):
        """Test que verifica el rechazo de creación sin campos requeridos"""
        incomplete_data = {
            "username": "newuser",
            "email": "newuser@test.com"
        }

        serializer = UserSerializer(data=incomplete_data)
        assert not serializer.is_valid()
        assert 'name' in serializer.errors
        assert 'surname' in serializer.errors
        assert 'password' in serializer.errors

    def test_actualizacion_campos_unicos(self, api_client, create_user):
        """Test que verifica la validación de campos únicos en actualización"""

        User.objects.create(
            username="otheruser",
            email="other@test.com",
            name="Other",
            surname="User",
            password=make_password("password123")
        )

        api_client.force_authenticate(user=create_user)
        url = reverse('app:user-detail', args=[create_user.id])

        update_data = {
            "username": "otheruser",
            "email": "other@test.com"
        }

        response = api_client.patch(url, data=update_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        create_user.refresh_from_db()
        assert create_user.username == "testuser"
