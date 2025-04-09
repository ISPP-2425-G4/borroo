import pytest
from django.urls import reverse
from django.utils.timezone import now, timedelta
from rest_framework.test import APIClient
import stripe
from rentas.models import Rent, RentStatus, PaymentStatus
from pagos.models import PaidPendingConfirmation
from usuarios.models import User
from objetos.models import Item, CancelType, PriceCategory, ItemCategory
from objetos.models import ItemSubcategory
from decimal import Decimal
from unittest.mock import patch

# ==================== FIXTURES GLOBALES ====================


@pytest.fixture
def owner():
    return User.objects.create(username="owner", email="owner@test.com",
                               saldo=Decimal("0"))


@pytest.fixture
def renter():
    return User.objects.create(username="renter", email="renter@test.com",
                               saldo=Decimal("0"))


@pytest.fixture
def item(owner):
    return Item.objects.create(
        title="Laptop",
        description="Gaming",
        category=ItemCategory.TECHNOLOGY,
        subcategory=ItemSubcategory.COMPUTERS,
        cancel_type=CancelType.FLEXIBLE,
        price_category=PriceCategory.DAY,
        price=100,
        deposit=Decimal("20.00"),
        user=owner,
    )


@pytest.fixture
def rent(renter, item):
    rent = Rent.objects.create(
        item=item,
        renter=renter,
        start_date=now() - timedelta(days=4),
        end_date=now() - timedelta(days=2),
        rent_status=RentStatus.ACCEPTED,
        total_price=200,
        commission=20,
        payment_status=PaymentStatus.PAID,
    )
    PaidPendingConfirmation.objects.create(rent=rent)
    return rent

# ==================== TESTS UNITARIOS ====================


@pytest.mark.django_db
class TestPayments:

    def test_renter_confirms_payment(self, rent):
        client = APIClient()
        url = reverse("set_renter_confirmation")
        response = client.post(url, {"rent_id": rent.id,
                                     "user_id": rent.renter.id}, format="json")

        assert response.status_code == 200
        confirmation = PaidPendingConfirmation.objects.get(rent=rent)
        assert confirmation.is_confirmed_by_renter is True

    def test_owner_confirms_payment(self, rent):
        client = APIClient()
        url = reverse("set_renter_confirmation")
        response = client.post(url, {"rent_id": rent.id,
                                     "user_id": rent.item.user.id},
                               format="json")

        assert response.status_code == 200
        confirmation = PaidPendingConfirmation.objects.get(rent=rent)
        assert confirmation.is_confirmed_by_owner is True

    def test_auto_confirm_renter_after_2_days(self, rent, monkeypatch):
        monkeypatch.setattr("pagos.views.SCHEDULER_TOKEN", "test-token")
        client = APIClient()
        url = reverse("process_pending_confirmations")
        response = client.post(url, {"token": "test-token"}, format="json")

        assert response.status_code == 200
        confirmation = PaidPendingConfirmation.objects.get(rent=rent)
        assert confirmation.is_confirmed_by_renter is True

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_rent_checkout_paid_success(self, mock_stripe, rent):
        PaidPendingConfirmation.objects.filter(rent=rent).delete()

        mock_stripe.return_value = type("Session", (), {
            "payment_status": "paid",
            "metadata": {"rent_id": rent.id, "user_id": rent.renter.id}
        })

        client = APIClient()
        response = client.get(reverse("confirmar_pago",
                                      args=["fake_session_id"]))
        assert response.status_code == 200
        rent.refresh_from_db()
        assert rent.payment_status == PaymentStatus.PAID

    @patch("stripe.checkout.Session.create")
    def test_create_rent_checkout_success(self, mock_create, renter, rent):
        mock_create.return_value = type("Session", (),
                                        {"id": "fake_session_id"})

        client = APIClient()
        url = reverse("create_checkout_session")

        payload = {
            "user_id": renter.id,
            "rent_id": rent.id,
            "price": 200,
            "currency": "EUR"
        }

        response = client.post(url, payload, format="json")

        assert response.status_code == 200
        assert response.json()["id"] == "fake_session_id"

    @patch("stripe.checkout.Session.create")
    def test_create_subscription_checkout_success(self, mock_create, renter):
        mock_create.return_value = type("Session", (),
                                        {"id": "sub_session_id"})

        client = APIClient()
        url = reverse("create_subscription_checkout")
        payload = {
            "user_id": renter.id,
            "price": 999,
            "currency": "EUR"
        }

        response = client.post(url, payload, format="json")

        assert response.status_code == 200
        assert response.json()["id"] == "sub_session_id"

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_subscription_checkout_success(self, mock_stripe, renter):
        mock_stripe.return_value = type("Session", (), {
            "payment_status": "paid",
            "metadata": {"user_id": renter.id},
            "customer": "cus_test",
            "subscription": "sub_test"
        })

        client = APIClient()
        response = client.get(reverse("confirm_subscription_checkout",
                                      args=["session_id"]))

        assert response.status_code == 200
        renter.refresh_from_db()
        assert renter.pricing_plan == "premium"
        assert renter.stripe_customer_id == "cus_test"

    def test_user_without_permission_cannot_confirm(self, rent):
        client = APIClient()
        another_user = User.objects.create(username="hacker")
        url = reverse("set_renter_confirmation")
        response = client.post(url,
                               {"rent_id": rent.id,
                                "user_id": another_user.id},
                               format="json")

        assert response.status_code == 403
        assert "permisos" in response.data["error"]

    def test_rent_not_found_on_confirmation(self):
        client = APIClient()
        url = reverse("set_renter_confirmation")
        response = client.post(url, {"rent_id": 9999, "user_id": 1},
                               format="json")

        assert response.status_code == 404
        assert "Renta no encontrada" in response.data["error"]

    def test_process_confirmations_with_invalid_token(self):
        client = APIClient()
        url = reverse("process_pending_confirmations")
        response = client.post(url, {"token": "wrong-token"}, format="json")

        assert response.status_code == 403
        assert "Token inválido" in response.data["error"]

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_rent_checkout_unpaid(self, mock_stripe):
        mock_stripe.return_value = type("Session", (), {
            "payment_status": "unpaid",
            "metadata": {}
        })

        client = APIClient()
        response = client.get(reverse("confirmar_pago",
                                      args=["session_unpaid"]))
        assert response.status_code == 402
        assert response.json()["status"] == "unpaid"

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_rent_checkout_invalid_metadata(self, mock_stripe):
        mock_stripe.return_value = type("Session", (), {
            "payment_status": "paid",
            "metadata": {}
        })

        client = APIClient()
        response = client.get(reverse("confirmar_pago",
                                      args=["session_id"]))
        assert response.status_code == 400
        assert "rent_id o user_id no encontrado" in response.json()["error"]

    @patch("stripe.checkout.Session.retrieve",
           side_effect=Exception("Stripe error"))
    def test_confirm_rent_checkout_stripe_error(self, mock_stripe):
        client = APIClient()
        response = client.get(reverse("confirmar_pago",
                                      args=["session_id"]))
        assert response.status_code == 400
        assert "Stripe error" in response.json()["error"]

# ==================== TEST DE INTEGRACIÓN REAL CON STRIPE ====================


@pytest.mark.django_db
def test_real_stripe_checkout_session(renter, rent, settings):
    stripe.api_key = settings.STRIPE_SECRET_KEY

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=[{
            "price_data": {
                "currency": "eur",
                "product_data": {
                    "name": rent.item.title,
                },
                "unit_amount": int(rent.total_price * 100),
            },
            "quantity": 1,
        }],
        metadata={
            "rent_id": rent.id,
            "user_id": renter.id,
        },
        success_url="https://example.com/success",
        cancel_url="https://example.com/cancel",
    )

    assert session["id"].startswith("cs_test_")
    print(f"\n👉 Abre esta URL para pagar manualmente: {session.url}")
