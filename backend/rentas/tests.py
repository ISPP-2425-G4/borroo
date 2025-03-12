import pytest
from django.utils import timezone
from rest_framework.test import APIClient
from usuarios.models import User 
from objetos.models import Item
from rentas.models import Rent, RentStatus
from decimal import Decimal


@pytest.mark.django_db
def test_take_rent():
    client = APIClient()

    user = User.objects.create(
        username="testuser",
        password="testpassword",
        email="testuser@example.com",
        name="Test",
        surname="User",
        phone_number="123456789",
        country="Country",
        city="City",
        address="Test Address",
        postal_code="12345",
        is_verified=True,
        pricing_plan="free"
    )

    client.force_authenticate(user=user)

    # Crear un objeto para alquilar
    item = Item.objects.create(title="Laptop", price=50.0, 
                               price_category="day")

    # Definir fechas de alquiler válidas
    start_date = timezone.now()
    end_date = start_date + timezone.timedelta(days=3)

    # Datos para la solicitud de alquiler
    rent_data = {
        "item": item.id,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat()
    }

    response = client.post("/rentas/full/first_request/", 
                           rent_data, format="json")

    # Verificar que se creó correctamente el alquiler
    assert response.status_code == 201
    rent = Rent.objects.get(item=item, renter=user)
    assert rent.rent_status == RentStatus.REQUESTED  # Estado inicial
    assert rent.start_date == start_date
    assert rent.end_date == end_date
    # 3 días * 50/día * 1.075 (7.5% extra)
    assert rent.total_price == round(3 * 50 * 1.075, 2)  
    assert rent.commission == round(3 * 50 * 0.15, 2)  # 15% de comisión

    response_conflict = client.post("/rentas/full/first_request/", 
                                    rent_data, format="json")

    assert response_conflict.status_code == 400
    assert "error" in response_conflict.data
    assert response_conflict.data["error"] == (
        "El objeto no está disponible en esas fechas"
    )


@pytest.mark.django_db
def test_rent_invalid_dates():
    client = APIClient()

    user = User.objects.create(
        username="testuser",
        password="testpassword",
        email="testuser@example.com",
        name="Test",
        surname="User",
        phone_number="123456789",
        country="Country",
        city="City",
        address="Test Address",
        postal_code="12345",
        is_verified=True,
        pricing_plan="free"
    )

    client.force_authenticate(user=user)
    item = Item.objects.create(title="Bicicleta", price=30.0, 
                               price_category="day")

    # Definir fechas inválidas (start_date >= end_date)
    start_date = timezone.now()
    end_date = start_date  # Fecha de fin igual a la de inicio

    rent_data = {
        "item": item.id,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat()
    }

    # Enviar la solicitud con fechas inválidas
    response = client.post("/rentas/full/first_request/", 
                           rent_data, format="json")

    # Validar que la API rechaza la solicitud con un error 400
    assert response.status_code == 400
    assert "end_date" in response.data
    assert "posterior" in str(response.data["end_date"][0])


@pytest.mark.django_db
def test_rent_non_existent_item():
    client = APIClient()

    user = User.objects.create(
        username="testuser",
        password="testpassword",
        email="testuser@example.com",
        name="Test",
        surname="User",
        phone_number="123456789",
        country="Country",
        city="City",
        address="Test Address",
        postal_code="12345",
        is_verified=True,
        pricing_plan="free"
    )

    client.force_authenticate(user=user)

    start_date = timezone.now()
    end_date = start_date + timezone.timedelta(days=3)

    rent_data = {
        "item": 9999,  # ID de un objeto que no existe
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat()
    }

    response = client.post("/rentas/full/first_request/", 
                           rent_data, format="json")

    print("Response status:", response.status_code)
    print("Response data:", response.data)

    assert response.status_code == 400
    assert "item" in response.data


@pytest.mark.django_db
def test_rent_overlapping_dates():
    client = APIClient()

    user = User.objects.create(
        username="testuser",
        password="testpassword",
        email="testuser@example.com",
        name="Test",
        surname="User",
        phone_number="123456789",
        country="Country",
        city="City",
        address="Test Address",
        postal_code="12345",
        is_verified=True,
        pricing_plan="free"
    )

    client.force_authenticate(user=user)

    item = Item.objects.create(title="Proyector", 
                               price=Decimal("80.0"), price_category="day")

    start_date = timezone.now()
    end_date = start_date + timezone.timedelta(days=2)

    Rent.objects.create(item=item, renter=user, start_date=start_date, 
                        end_date=end_date, rent_status=RentStatus.REQUESTED)

    # Intento de alquilar el mismo objeto en las mismas fechas
    rent_data = {
        "item": item.id,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat()
    }

    response = client.post("/rentas/full/first_request/", 
                           rent_data, format="json")

    print("Response status:", response.status_code)
    print("Response data:", response.data)

    assert response.status_code == 400
    assert "error" in response.data
    expected_error = "El objeto no está disponible en esas fechas"
    assert response.data["error"] == expected_error
