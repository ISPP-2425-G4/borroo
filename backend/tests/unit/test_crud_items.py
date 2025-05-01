import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from usuarios.models import User
from objetos.models import Item
from django.contrib.auth.hashers import make_password
from decimal import Decimal
from objetos.models import ItemImage


@pytest.mark.django_db
class TestItemEndpoints:
    @pytest.fixture
    def user_data(self):
        return {
            "name": "Test User",
            "surname": "Normal",
            "username": "testuser",
            "email": "testuser@example.com",
            "phone_number": "+34678432345",
            "country": "Test Country",
            "city": "Test City",
            "address": "Test Address",
            "postal_code": "12345",
            "dni": "12345678A",
            "is_verified": True,
            "verified_account": True,
            "pricing_plan": "free",
            "password": make_password("Password123!")
        }

    @pytest.fixture
    def create_user(self, user_data):
        return User.objects.create(**user_data)

    @pytest.fixture
    def create_item(self, create_user):
        return Item.objects.create(
            title="Test Item",
            description="Test Description",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=25.50,
            deposit=10.00,
            user=create_user,
            draft_mode=False
        )

    @pytest.fixture
    def auth_client(self):
        return APIClient()

    @pytest.fixture
    def authenticated_client(self, auth_client, create_user):
        url = reverse('app:user-login')
        data = {
            "usernameOrEmail": "testuser",
            "password": "Password123!"
        }
        response = auth_client.post(url, data, format='json')
        assert response.status_code == 200
        token = response.data["access"]
        auth_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return auth_client

    def test_lectura_lista_items(self, auth_client, create_item):
        url = reverse('item-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_lectura_detalle_item(self, auth_client, create_item):
        url = reverse('item-detail', args=[create_item.id])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == "Test Item"

    def test_eliminacion_item(
            self, authenticated_client, create_user, create_item):
        url = reverse('item-detail', args=[create_item.id])
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Item.objects.count() == 0

    def test_eliminacion_item_sin_autenticacion(
            self, auth_client, create_item):
        url = reverse('item-detail', args=[create_item.id])
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert Item.objects.filter(id=create_item.id).exists()

    def test_lectura_detalle_item_no_existente(self, auth_client):
        url = reverse('item-detail', args=[999])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_actualizacion_item_exitosa(
            self, authenticated_client, create_item):
        """Test que verifica la actualización exitosa de un item"""
        url = reverse('item-detail', args=[create_item.id])
        updated_data = {
            "title": "Updated Title",
            "description": "Updated Description",
            "category": "technology",
            "subcategory": "computers",
            "cancel_type": "flexible",
            "price_category": "day",
            "price": 35.50,
            "deposit": 15.00,
            "draft_mode": True
        }
        response = authenticated_client.patch(
            url, data=updated_data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == "Updated Title"
        assert float(response.data['price']) == 35.50

        updated_item = Item.objects.get(id=create_item.id)
        assert updated_item.title == "Updated Title"
        assert float(updated_item.price) == 35.50

    def test_actualizacion_item_sin_autenticacion(
            self, auth_client, create_item):
        """Test que verifica que un usuario no
        autenticado no puede actualizar items"""
        url = reverse('item-detail', args=[create_item.id])
        updated_data = {
            "title": "Updated Title",
            "description": "Updated Description"
        }
        response = auth_client.patch(url, data=updated_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        item = Item.objects.get(id=create_item.id)
        assert item.title == "Test Item"

    def test_actualizacion_item_otro_usuario(
            self, authenticated_client, create_item):
        """Test que verifica que un usuario no
        puede actualizar items de otro usuario"""

        other_user = User.objects.create(
            username="otheruser",
            password=make_password("Password123!"),
            email="other@test.com",
            name="Other",
            surname="User",
            verified_account=True
        )

        other_item = Item.objects.create(
            title="Other Item",
            description="Other Description",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=25.50,
            deposit=10.00,
            user=other_user,
            draft_mode=False
        )

        url = reverse('item-detail', args=[other_item.id])
        updated_data = {
            "title": "Updated Title",
            "description": "Updated Description"
        }
        response = authenticated_client.patch(url, data=updated_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        item = Item.objects.get(id=other_item.id)
        assert item.title == "Other Item"

    def test_eliminacion_item_otro_usuario(
            self, authenticated_client, create_item):
        """Test que verifica que un usuario no
        puede eliminar items de otro usuario"""

        other_user = User.objects.create(
            username="otheruser",
            password=make_password("Password123!"),
            email="other@test.com",
            name="Other",
            surname="User",
            verified_account=True
        )

        other_item = Item.objects.create(
            title="Other Item",
            description="Other Description",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=25.50,
            deposit=10.00,
            user=other_user,
            draft_mode=False
        )

        url = reverse('item-detail', args=[other_item.id])
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Item.objects.filter(id=other_item.id).exists()

    def test_actualizacion_item_datos_invalidos(
            self, authenticated_client, create_item):
        """Test que verifica la validación de datos en la actualización"""
        url = reverse('item-detail', args=[create_item.id])
        invalid_data = {
            "price": -50.00,
            "deposit": -10.00
        }
        response = authenticated_client.patch(url, data=invalid_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        item = Item.objects.get(id=create_item.id)
        assert float(item.price) == 25.50

    def test_creacion_item_exitosa(self, authenticated_client, create_user):
        """Test que verifica la creación exitosa de un item"""
        url = reverse('item-list')
        item_data = {
            "title": "New Item",
            "description": "New Description",
            "category": "technology",
            "cancel_type": "flexible",
            "price_category": "day",
            "price": 30.00,
            "deposit": 12.00,
            "draft_mode": True
        }
        response = authenticated_client.post(url, data=item_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == "New Item"
        assert Item.objects.count() == 1

    def test_creacion_item_sin_autenticacion(self, auth_client):
        """Test que verifica que un usuario
        no autenticado no puede crear items"""
        url = reverse('item-list')
        item_data = {
            "title": "New Item",
            "description": "New Description",
            "category": "technology",
            "cancel_type": "flexible",
            "price_category": "day",
            "price": 30.00,
            "deposit": 12.00
        }
        response = auth_client.post(url, data=item_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert Item.objects.count() == 0


@pytest.mark.django_db
class TestItemExtras:

    @pytest.fixture
    def create_user(self):
        return User.objects.create(
            name="Draft",
            surname="Owner",
            username="draftowner",
            email="draft@example.com",
            password=make_password("Password123!"),
            verified_account=True,
            is_verified=True,
            pricing_plan="free",
            phone_number="+34600000000",
            address="Test St",
            postal_code="41001",
            city="Sevilla",
            country="España"
        )

    @pytest.fixture
    def create_item(self, create_user):
        return Item.objects.create(
            title="Draft Item",
            description="Test Draft",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=Decimal("10.00"),
            deposit=Decimal("5.00"),
            user=create_user,
            draft_mode=True
        )

    @pytest.fixture
    def auth_client(self):
        return APIClient()

    @pytest.fixture
    def authenticated_client(self, auth_client, create_user):
        response = auth_client.post("/usuarios/login/", {
            "usernameOrEmail": "draftowner",
            "password": "Password123!"
        })
        token = response.data["access"]
        auth_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return auth_client

    def test_listar_drafts(
        self, authenticated_client, create_user, create_item
    ):
        url = f"/objetos/list_draft_items/{create_user.id}/"
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['results'][0]['title'] == "Draft Item"

    def test_listar_items_usuario(
        self, authenticated_client, create_user, create_item
    ):
        url = f"/objetos/list_user_items/{create_user.id}/"
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['results'][0]['id'] == create_item.id

    def test_listar_items_publicados(self, auth_client, create_item):
        create_item.draft_mode = False
        create_item.save()
        response = auth_client.get("/objetos/list_published_items/")
        assert response.status_code == status.HTTP_200_OK
        assert any(
            item['id'] == create_item.id for item in response.data['results']
        )

    def test_listar_solicitudes(self, auth_client):
        response = auth_client.get("/objetos/list_item_requests/")
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data

    def test_enum_choices(self, auth_client):
        response = auth_client.get("/objetos/enum-choices/")
        assert response.status_code == status.HTTP_200_OK
        assert "categories" in response.data

    def test_filtrar_categoria(self, create_item, auth_client):
        create_item.draft_mode = False
        create_item.save()
        response = auth_client.get(
            "/objetos/filter_by_category/?category=technology"
        )
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1

    def test_filtrar_precio(self, create_item, auth_client):
        create_item.draft_mode = False
        create_item.save()
        response = auth_client.get(
            "/objetos/filter_by_price/?min_price=5&max_price=15"
        )
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1

    def test_toggle_like(self, authenticated_client, create_item):
        url = f"/objetos/like/{create_item.id}/"
        response = authenticated_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data

    def test_like_status(self, authenticated_client, create_item):
        url = f"/objetos/like-status/{create_item.id}/"
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert "is_liked" in response.data


@pytest.mark.django_db
class TestItemCriticalActions:

    @pytest.fixture
    def user_premium(self):
        return User.objects.create(
            username="premiumuser",
            email="premium@test.com",
            password=make_password("Password123!"),
            name="Premium",
            surname="User",
            verified_account=True,
            is_verified=True,
            pricing_plan="premium",
            phone_number="+34611111111",
            address="Calle Premium",
            postal_code="41001",
            city="Sevilla",
            country="España"
        )

    @pytest.fixture
    def user_normal(self):
        return User.objects.create(
            username="normaluser",
            email="normal@test.com",
            password=make_password("Password123!"),
            name="Normal",
            surname="User",
            verified_account=True,
            is_verified=True,
            pricing_plan="free",
            phone_number="+34600000000",
            address="Calle Normal",
            postal_code="41001",
            city="Sevilla",
            country="España"
        )

    @pytest.fixture
    def item_premium(self, user_premium):
        return Item.objects.create(
            title="Item Premium",
            description="Descripción premium",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=Decimal("25.00"),
            deposit=Decimal("10.00"),
            user=user_premium,
            draft_mode=True
        )

    @pytest.fixture
    def item_normal(self, user_normal):
        return Item.objects.create(
            title="Item Normal",
            description="Descripción normal",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=Decimal("15.00"),
            deposit=Decimal("5.00"),
            user=user_normal,
            draft_mode=False
        )

    @pytest.fixture
    def auth_client_premium(self, user_premium):
        client = APIClient()
        login_data = {
            "usernameOrEmail": user_premium.email,
            "password": "Password123!"
        }
        response = client.post("/usuarios/login/", login_data, format='json')
        token = response.data["access"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return client

    @pytest.fixture
    def authenticated_client(self, user_normal):
        client = APIClient()
        login_data = {
            "usernameOrEmail": user_normal.email,
            "password": "Password123!"
        }
        response = client.post("/usuarios/login/", login_data, format='json')
        token = response.data["access"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return client

    def test_toggle_feature_exitoso(self, auth_client_premium, item_premium):
        item_premium.draft_mode = False
        item_premium.save()

        url = "/objetos/full/toggle_feature/"
        data = {
            "item_id": item_premium.id,
            "user_id": item_premium.user.id
        }
        response = auth_client_premium.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data

    def test_toggle_feature_falla_no_premium(
        self, authenticated_client, item_normal
    ):
        url = "/objetos/full/toggle_feature/"
        data = {
            "item_id": item_normal.id,
            "user_id": item_normal.user.id
        }
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "error" in response.data

    def test_publish_item_exitoso(self, auth_client_premium, item_premium):
        # Asegura que el item tiene al menos una imagen (obligatorio)
        ItemImage.objects.create(
            item=item_premium, image="https://example.com/image.jpg"
        )

        url = "/objetos/publish_item/"
        data = {
            "item_id": item_premium.id
        }
        response = auth_client_premium.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Ítem publicado con éxito"


@pytest.mark.django_db
class TestUnavailablePeriods:

    @pytest.fixture
    def premium_user(self):
        return User.objects.create(
            username="premiumuser2",
            email="premium2@test.com",
            password=make_password("Password123!"),
            pricing_plan="premium",
            verified_account=True,
            is_verified=True,
            phone_number="+34600000000",
            address="Calle Prueba",
            postal_code="41001",
            city="Sevilla",
            country="España"
        )

    @pytest.fixture
    def auth_client_premium(self, premium_user):
        client = APIClient()
        url = reverse('app:user-login')
        response = client.post(url, {
            "usernameOrEmail": premium_user.username,
            "password": "Password123!"
        }, format='json')
        token = response.data["access"]
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return client

    @pytest.fixture
    def item_premium(self, premium_user):
        item = Item.objects.create(
            title="Premium Item 2",
            description="Premium Description 2",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=Decimal("50.00"),
            deposit=Decimal("20.00"),
            user=premium_user,
            draft_mode=False
        )
        ItemImage.objects.create(
            item=item, image="https://example.com/test.jpg"
        )
        return item

    def test_creacion_item_con_unavailable_period_mal_formado(
        self, auth_client_premium
    ):
        url = reverse('item-list')
        data = {
            "title": "Item Erróneo",
            "description": "Fechas inválidas",
            "category": "technology",
            "cancel_type": "flexible",
            "price_category": "day",
            "price": 100.0,
            "deposit": 30.0,
            "draft_mode": True,
            "unavailable_periods": [
                {
                    "start_date": "2030-01-10",
                    "end_date": "2030-01-01"
                }
            ],
            "image_files": []
        }
        response = auth_client_premium.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestSearchItems:

    @pytest.fixture
    def create_user_and_items(self):
        user = User.objects.create(
            username="searchuser",
            email="search@test.com",
            password=make_password("Password123!"),
            verified_account=True
        )
        Item.objects.create(
            title="Laptop Gaming",
            description="Para juegos",
            category="technology",
            cancel_type="flexible",
            price_category="day",
            price=1200.00,
            deposit=100.00,
            user=user,
            draft_mode=False
        )
        Item.objects.create(
            title="Balón de fútbol",
            description="Deporte",
            category="sports",
            cancel_type="flexible",
            price_category="day",
            price=20.00,
            deposit=5.00,
            user=user,
            draft_mode=False
        )
        return user

    def test_busqueda_por_titulo(self, create_user_and_items):
        """Test de búsqueda por título"""
        client = APIClient()
        url = "/objetos/search_item/?title=Laptop"
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert any(
            "Laptop" in item["title"] for item in response.data["results"]
        )

    def test_busqueda_por_categoria(self, create_user_and_items):
        """Test de búsqueda por categoría"""
        client = APIClient()
        url = "/objetos/search_item/?category=sports"
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert all(
            item["category"] == "sports" for item in response.data["results"]
        )

    def test_busqueda_por_precio_minimo_y_maximo(self, create_user_and_items):
        """Test de búsqueda por rango de precios"""
        client = APIClient()
        url = "/objetos/search_item/?min_price=1000&max_price=1300"
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert all(
            1000 <= float(item["price"]) <= 1300
            for item in response.data["results"]
        )

    def test_busqueda_con_precio_invalido(self, create_user_and_items):
        """Test de error cuando el precio mínimo no es válido"""
        client = APIClient()
        url = "/objetos/search_item/?min_price=abc"
        response = client.get(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
