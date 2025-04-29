import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.hashers import make_password
from usuarios.models import User
from objetos.models import Item
from rentas.models import Rent
from decimal import Decimal
import io
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile


@pytest.mark.django_db
class TestAdminOperations:
    @pytest.fixture
    def admin_user(self):
        return User.objects.create(
            username="adminuser",
            email="admin@example.com",
            password=make_password("AdminPassword123!"),
            is_admin=True,
            name="Admin",
            surname="User",
            phone_number="+34666666666",
            country="España",
            city="Sevilla",
            address="Calle Test 123",
            postal_code="41012",
            dni="12345678A",
            is_verified=True,
            verified_account=True
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

    @pytest.fixture
    def user(self):
        return User.objects.create(
            username="testuser",
            email="testuser@example.com",
            password=make_password("TestPassword123!"),
            is_admin=False
        )

    @pytest.fixture
    def item(self, admin_user):
        return Item.objects.create(
            title="Test Item",
            description="Test Description",
            category="technology",
            subcategory="computers",
            cancel_type="flexible",
            price_category="month",  # Cambiado a month
            price=Decimal("10.00"),
            deposit=Decimal("5.00"),
            user=admin_user
        )

    @pytest.fixture
    def rent(self, admin_user, item):
        from datetime import datetime
        return Rent.objects.create(
            item=item,
            renter=admin_user,
            start_date=datetime(2025, 4, 1),  # Primer día del mes
            end_date=datetime(2025, 4, 30),   # Último día del mes (30 días)
            rent_status="requested",
            payment_status="pending",
            total_price=300.00,
            commission=45.00
        )

    @pytest.fixture
    def test_image(self):
        file = io.BytesIO()
        image = Image.new('RGB', (100, 100), color='red')
        image.save(file, 'JPEG')
        file.seek(0)

        return SimpleUploadedFile(
            name='test.jpg',
            content=file.read(),
            content_type='image/jpeg'
        )

    def test_create_item(self, api_client, admin_user, test_image):
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:create-item")

        data = {
            "title": "New Item",
            "description": "Item Description",
            "category": "technology",
            "subcategory": "computers",
            "cancel_type": "flexible",
            "price_category": "day",
            "price": "10.00",
            "deposit": "5.00",
            "draft_mode": False
        }

        form_data = data.copy()
        form_data['image_files'] = test_image

        response = api_client.post(
            url,
            form_data,
            format='multipart'
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert Item.objects.filter(title="New Item").exists()

    def test_update_item(self, api_client, admin_user, item, test_image):
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:update-item", args=[item.id])

        data = {
            "title": "Updated Item",
            "description": item.description,
            "category": item.category,
            "subcategory": item.subcategory,
            "cancel_type": item.cancel_type,
            "price_category": item.price_category,
            "price": str(item.price),
            "deposit": str(item.deposit),
            "draft_mode": item.draft_mode,
            "user": admin_user.id
        }

        form_data = data.copy()
        form_data['image_files'] = test_image

        response = api_client.put(
            url,
            form_data,
            format='multipart'
        )

        assert response.status_code in [
            status.HTTP_200_OK, status.HTTP_201_CREATED]
        item.refresh_from_db()
        assert item.title == "Updated Item"

    def test_delete_item(self, api_client, admin_user, item):
        """Verifica que un administrador puede eliminar un ítem."""
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:delete-item", args=[item.id])
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Item.objects.filter(id=item.id).exists()

    def test_list_items(self, api_client, admin_user):
        """Verifica que un administrador puede listar ítems."""
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:list-items")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)

    def test_update_rent(self, api_client, admin_user, rent):
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:update-rent", args=[rent.id])

        data = {
            "rent_status": "accepted",
            "payment_status": "pending",
            "start_date": rent.start_date.strftime("%Y-%m-%d"),
            "end_date": rent.end_date.strftime("%Y-%m-%d"),
            "total_price": str(rent.total_price),
            "commission": str(rent.commission),
            "item": rent.item.id,
            "renter": rent.renter.id,
            "price_category": "month"
        }

        print("Item price_category:", rent.item.price_category)
        print("Rent duration in days:", (rent.end_date - rent.start_date).days)

        response = api_client.put(
            url,
            data,
            format="json"
        )

        if response.status_code == 400:
            print("Response data:", response.data)
            print("Request data:", data)

        assert response.status_code == status.HTTP_200_OK
        rent.refresh_from_db()
        assert rent.rent_status == "accepted"

    def test_delete_rent(self, api_client, admin_user, rent):
        """Verifica que un administrador puede eliminar una renta."""
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:delete-rent", args=[rent.id])
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Rent.objects.filter(id=rent.id).exists()

    def test_list_rents(self, api_client, admin_user):
        """Verifica que un administrador puede listar rentas."""
        api_client.force_authenticate(user=admin_user)
        url = reverse("app:rent-list")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
