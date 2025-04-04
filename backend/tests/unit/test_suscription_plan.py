import pytest
from rest_framework.exceptions import ValidationError
from usuarios.models import User
from objetos.models import Item
from objetos.serializers import ItemSerializer
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIRequestFactory


@pytest.fixture
def user():
    return User.objects.create(
        username="testuser",
        name="Test",
        surname="User",
        email="testuser@example.com",
        password=make_password("Borroo_25"),
        phone_number="+1234567890",
        country="España",
        city="Madrid",
        address="Calle Test",
        postal_code="28001",
        is_verified=True,
        pricing_plan="free",
        verified_account=True
    )


@pytest.fixture
def item_data(user):
    return {
        "title": "Nuevo Objeto",
        "description": "Descripción del nuevo objeto",
        "category": "technology",
        "cancel_type": "flexible",
        "price_category": "day",
        "price": 25.50,
        "user": user.id,
        "draft_mode": False,
        "images": [],
        "image_files": [],
    }


@pytest.fixture
def request_factory():
    return APIRequestFactory()


@pytest.mark.django_db
class TestItemSerializer:
    def test_create_item_with_valid_data(
            self, user, item_data, request_factory):
        request = request_factory.post('/')
        request.user = user

        item_data["user"] = user.id
        serializer = ItemSerializer(
            data=item_data, context={'request': request})
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()
        assert item.title == item_data["title"]
        assert item.user == user

    def test_create_item_with_too_many_draft_mode_false_items(
            self, user, item_data, request_factory):
        request = request_factory.post('/')
        request.user = user

        for _ in range(10):
            Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=False,
            )

        item_data["draft_mode"] = False
        item_data["user"] = user.id

        serializer = ItemSerializer(
            data=item_data, context={'request': request})
        with pytest.raises(ValidationError) as excinfo:
            serializer.is_valid(raise_exception=True)

        assert "No puedes tener más de 10 ítems publicados con el plan Free." in str(excinfo.value)

    def test_create_item_with_too_many_total_items(
            self, user, item_data, request_factory):
        request = request_factory.post('/')
        request.user = user

        for _ in range(15):
            Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=True,
            )

        item_data["user"] = user.id
        serializer = ItemSerializer(
            data=item_data, context={'request': request})
        with pytest.raises(ValidationError) as excinfo:
            serializer.is_valid(raise_exception=True)

        assert ("No puedes tener más de 15 ítems en total con el plan Free."
                in str(excinfo.value))

    def test_create_item_with_valid_data_within_limits(self, user, item_data, request_factory):
        request = request_factory.post('/')
        request.user = user
        
        for _ in range(5):
            item = Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=False,
            )
            # Añadir imagen para items publicados
            item.images.create(image="https://ejemplo.com/imagen.jpg")

        # Creamos un nuevo item en modo borrador (no necesita imágenes)
        new_item_data = item_data.copy()
        new_item_data["draft_mode"] = True
        new_item_data["images"] = []  # No necesita imágenes en draft

        serializer = ItemSerializer(data=new_item_data, context={'request': request})
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()

        assert item.title == new_item_data["title"]
        assert item.user == user
        assert Item.objects.filter(user=user, draft_mode=False).count() == 5

    def test_create_item_valid_data_below_total_limit(
            self, user, item_data, request_factory):
        request = request_factory.post('/')
        request.user = user

        for _ in range(10):
            Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=True,
            )

        item_data["user"] = user.id
        serializer = ItemSerializer(
            data=item_data, context={'request': request})
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()

        assert item.title == item_data["title"]
        assert item.user == user
        assert Item.objects.filter(user=user).count() == 11

    def test_create_draft_item_when_at_non_draft_limit(
            self, user, item_data, request_factory):
        request = request_factory.post('/')
        request.user = user

        for _ in range(10):
            Item.objects.create(
                title="Objeto",
                description="Descripción",
                category="technology",
                cancel_type="flexible",
                price_category="day",
                price=25.50,
                user=user,
                draft_mode=False,
            )

        item_data["user"] = user.id
        item_data["draft_mode"] = True
        item_data["image_files"] = []  # No necesita imágenes en draft

        serializer = ItemSerializer(
            data=item_data, context={'request': request})
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()

        assert item.draft_mode is True
        assert Item.objects.filter(user=user, draft_mode=False).count() == 10
        assert Item.objects.filter(user=user).count() == 11
