import pytest
from rest_framework.exceptions import ValidationError
from usuarios.models import User
from objetos.models import Item
from objetos.serializers import ItemSerializer
from django.contrib.auth.hashers import make_password


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
        "user": user.id,  # Asegurar que el campo user sea el ID del usuario
        "draft_mode": False,
        "images": [],
        "image_files": [],
    }


@pytest.mark.django_db
class TestItemSerializer:
    def test_create_item_with_valid_data(self, user, item_data):
        item_data["user"] = user.id
        serializer = ItemSerializer(data=item_data)
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()
        assert item.title == item_data["title"]
        assert item.user == user

    def test_create_item_with_too_many_draft_mode_false_items(
        self, user, item_data
    ):
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

        serializer = ItemSerializer(data=item_data)
        with pytest.raises(ValidationError) as excinfo:
            serializer.is_valid(raise_exception=True)

        assert (
            "No puedes tener más de 10 ítems con draft_mode en False."
            in str(excinfo.value)
        )

    def test_create_item_with_too_many_total_items(self, user, item_data):
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
        serializer = ItemSerializer(data=item_data)
        with pytest.raises(ValidationError) as excinfo:
            serializer.is_valid(raise_exception=True)

        assert (
            "No puedes tener más de 15 ítems en total." in str(excinfo.value)
        )

    def test_create_item_with_valid_data_within_limits(self, user, item_data):
        for _ in range(5):
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
        serializer = ItemSerializer(data=item_data)
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()

        assert item.title == item_data["title"]
        assert item.user == user
        assert Item.objects.filter(user=user, draft_mode=False).count() == 6

    def test_create_item_valid_data_below_total_limit(self, user, item_data):
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
        serializer = ItemSerializer(data=item_data)
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()

        assert item.title == item_data["title"]
        assert item.user == user
        assert Item.objects.filter(user=user).count() == 11

    def test_create_draft_item_when_at_non_draft_limit(self, user, item_data):
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

        serializer = ItemSerializer(data=item_data)
        assert serializer.is_valid(), serializer.errors
        item = serializer.save()

        assert item.title == item_data["title"]
        assert item.user == user
        assert item.draft_mode is True
        assert Item.objects.filter(user=user, draft_mode=False).count() == 10
        assert Item.objects.filter(user=user).count() == 11
