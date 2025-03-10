import pytest
from django.urls import reverse
from rest_framework import status
from usuarios.models import User
from django.contrib.auth.hashers import make_password


class TestData:
    @staticmethod
    def create_user():
        """
        Crea y devuelve un usuario normal.
        """
        user_data = {
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
        return User.objects.create(**user_data)

    @staticmethod
    def create_admin_user():
        """
        Crea y devuelve un usuario administrador.
        """
        admin_data = {
            "name": "Admin User",
            "surname": "Admin",
            "username": "adminuser",
            "email": "adminuser_1@example.com",
            "phone_number": "+34678432365",
            "country": "Admin Country",
            "city": "Admin City",
            "address": "Admin Address",
            "postal_code": "54321",
            "is_verified": True,
            "pricing_plan": "premium",
            "password": make_password("adminpassword"),
        }
        return User.objects.create(**admin_data)


@pytest.mark.django_db
def test_creacion_usuario():
    """
    Verifica que se pueda crear un usuario correctamente.
    """
    user_data = {
        "name": "John",
        "surname": "Doe",
        "username": "johndoe",
        "phone_number": "+34678435345",
        "country": "USA",
        "city": "New York",
        "address": "123 Main St",
        "postal_code": "10001",
        "is_verified": False,
        "pricing_plan": "free"
    }
    user = User.objects.create(**user_data)
    assert User.objects.count() == 1
    assert user.name == "John"
    assert user.username == "johndoe"
    assert user.pricing_plan == "free"


@pytest.mark.django_db
def test_lectura_usuario(client):
    """
    Verifica que se pueda obtener la lista de usuarios.
    """
    user_data = {
        "name": "Jane",
        "surname": "Smith",
        "username": "janesmith",
        "phone_number": "+34678422345",
        "country": "Canada",
        "city": "Toronto",
        "address": "456 Elm St",
        "postal_code": "M5V 3L9",
        "is_verified": True,
        "pricing_plan": "premium"
    }
    User.objects.create(**user_data)
    url = reverse('app:user-list')
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['username'] == "janesmith"


@pytest.mark.django_db
def test_lectura_detalle_usuario(client):
    """
    Verifica que se puedan obtener los detalles de un usuario específico.
    """
    user_data = {
        "name": "Alice",
        "surname": "Johnson",
        "username": "alicej",
        "phone_number": "+34678435345",
        "country": "UK",
        "city": "London",
        "address": "789 Oak St",
        "postal_code": "SW1A 1AA",
        "is_verified": True,
        "pricing_plan": "basic"
    }
    user = User.objects.create(**user_data)
    url = reverse('app:user-detail', args=[user.id])
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['username'] == "alicej"
    assert response.data['city'] == "London"


@pytest.mark.django_db
def test_actualizacion_usuario(client):
    """
    Verifica que se pueda actualizar un usuario existente.
    """
    # Crear un usuario normal y un administrador
    user = TestData.create_user()
    print(user)
    client.login(username='testuser', password='password123')

    # Datos actualizados
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

    # Realizar la solicitud PUT
    url = reverse('app:user-detail', args=[user.id])
    response = client.put(url, data=updated_data,
                          content_type='application/json')
    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.name == "Updated Name"
    assert user.city == "Updated City"
    assert user.pricing_plan == "premium"


@pytest.mark.django_db
def test_eliminacion_usuario(client):
    """
    Verifica que se pueda eliminar un usuario existente.
    """
    # Crear un usuario normal y un administrador
    user = TestData.create_user()

    client.login(username='testuser', password='password123')

    # Realizar la solicitud DELETE
    url = reverse('app:user-detail', args=[user.id])
    response = client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert User.objects.count() == 1  # Solo el administrador debe quedar
