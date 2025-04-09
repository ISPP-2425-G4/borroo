import pytest
from rest_framework.exceptions import ValidationError
from usuarios.models import User
from objetos.models import Item
from objetos.serializers import ItemSerializer
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIRequestFactory
import io
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile


@pytest.fixture
def user():
    return User.objects.create(
        username="testuser",
        name="Test",
        surname="User",
        email="testuser@example.com",
        password=make_password("Borroo_25"),
        phone_number="+1234567890",  # Required
        country="España",            # Required
        city="Madrid",              # Required
        address="Calle Test",       # Required
        postal_code="28001",        # Required
        dni="12345678A",            # Required - Adding DNI
        is_verified=True,
        verified_account=True,      # Add this to ensure user is verified
        pricing_plan="free"
    )


@pytest.fixture
def item_data(user, test_image):
    return {
        "title": "Nuevo Objeto",
        "description": "Descripción del nuevo objeto",
        "category": "technology",
        "cancel_type": "flexible",
        "price_category": "day",
        "price": 25.50,
        "deposit": 10.00,
        "user": user.id,
        "draft_mode": False,
        "images": [],
        "image_files": [test_image]  # Añadimos la imagen de prueba aquí
    }


@pytest.fixture
def test_image():
    file = io.BytesIO()
    image = Image.new('RGB', (100, 100), color='red')
    image.save(file, 'JPEG')
    file.seek(0)

    return SimpleUploadedFile(
        name='test.jpg',
        content=file.read(),
        content_type='image/jpeg'
    )


@pytest.mark.django_db
class TestItemSerializer:
    @pytest.fixture
    def api_request_factory(self):
        return APIRequestFactory()

    @pytest.fixture
    def mock_request(self, api_request_factory, user):
        request = api_request_factory.get('/')
        request.user = user
        return request

    def test_create_item_with_valid_data(self, user, item_data, mock_request):
        item_data["user"] = user.id
        item_data["draft_mode"] = True  # Set to draft mode initially
        serializer = ItemSerializer(data=item_data, context={'request': mock_request})
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()
        assert item.title == item_data["title"]
        assert item.user == user

    def test_create_item_with_too_many_draft_mode_false_items(
            self, user, item_data, mock_request):
        for _ in range(10):
            Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                deposit=10.00,
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=False,
            )

        item_data["draft_mode"] = False
        item_data["user"] = user.id

        serializer = ItemSerializer(
            data=item_data, context={'request': mock_request})
        with pytest.raises(ValidationError) as excinfo:
            serializer.is_valid(raise_exception=True)

        assert "No puedes tener más de 10 ítems publicados" in str(
            excinfo.value)

    def test_create_item_with_too_many_total_items(
            self, user, item_data, mock_request):
        for _ in range(15):
            Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                deposit=15.00,
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=True,
            )

        item_data["user"] = user.id
        serializer = ItemSerializer(
            data=item_data, context={'request': mock_request})
        with pytest.raises(ValidationError) as excinfo:
            serializer.is_valid(raise_exception=True)

        assert "No puedes tener más de 15 ítems en total" in str(excinfo.value)

    def test_create_item_with_valid_data_within_limits(
            self, user, item_data, mock_request, test_image):
        for _ in range(5):
            Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                deposit=10.00,
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=False,
            )

        item_data["user"] = user.id
        item_data["image_files"] = [test_image]  # Aseguramos que la imagen está presente
        serializer = ItemSerializer(data=item_data, context={'request': mock_request})
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()

        assert item.title == item_data["title"]
        assert item.user == user
        assert Item.objects.filter(user=user, draft_mode=False).count() == 6

    def test_create_item_valid_data_below_total_limit(
            self, user, item_data, mock_request, test_image):
        for _ in range(10):
            Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                deposit=10.00,
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=True,
            )

        item_data["user"] = user.id
        item_data["image_files"] = [test_image]  # Aseguramos que la imagen está presente
        serializer = ItemSerializer(data=item_data, context={'request': mock_request})
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()

        assert item.title == item_data["title"]
        assert item.user == user
        assert Item.objects.filter(user=user).count() == 11

    def test_create_draft_item_when_at_non_draft_limit(
            self, user, item_data, mock_request):
        for _ in range(10):
            Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                deposit=10.00,
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=False,
            )

        item_data["user"] = user.id
        item_data["draft_mode"] = True

        serializer = ItemSerializer(
            data=item_data, context={'request': mock_request})
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()

        assert item.title == item_data["title"]
        assert item.user == user
        assert item.draft_mode is True
        assert Item.objects.filter(user=user, draft_mode=False).count() == 10
        assert Item.objects.filter(user=user).count() == 11
