import json
from decimal import Decimal
from datetime import timedelta
import pytest
from django.urls import reverse
from django.utils.timezone import now
from rest_framework.test import APIClient
from unittest.mock import patch
from rentas.models import Rent, RentStatus, PaymentStatus
from pagos.models import PaidPendingConfirmation
from usuarios.models import User
from objetos.models import (
    Item, CancelType, PriceCategory, ItemCategory, ItemSubcategory
)


@pytest.fixture
def owner(db):
    return User.objects.create(username="owner", email="owner@test.com",
                               saldo=Decimal("100"))


@pytest.fixture
def renter(db):
    return User.objects.create(username="renter", email="renter@test.com",
                               saldo=Decimal("50"))


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
    return Rent.objects.create(
        item=item,
        renter=renter,
        start_date=now() - timedelta(days=4),
        end_date=now() - timedelta(days=2),
        rent_status=RentStatus.ACCEPTED,
        total_price=200,
        commission=20,
        payment_status=PaymentStatus.PAID,
    )


@pytest.mark.django_db
class TestPayments:

    @patch("stripe.checkout.Session.create")
    def test_create_rent_checkout_success(self, mock_create, renter, rent):
        mock_create.return_value = type("S", (), {"id": "sess_123"})
        client = APIClient()
        url = reverse("create_checkout_session")
        resp = client.post(url, {"user_id": renter.id, "rent_id": rent.id,
                                 "price": 200, "currency": "EUR"},
                           format="json")
        assert resp.status_code == 200
        assert resp.json()["id"] == "sess_123"

    def test_create_rent_checkout_wrong_method(self):
        client = APIClient()
        url = reverse("create_checkout_session")
        resp = client.get(url)
        assert resp.status_code == 405

    def test_create_rent_checkout_rent_not_found(self, renter):
        client = APIClient()
        url = reverse("create_checkout_session")
        resp = client.post(url, {"user_id": renter.id, "rent_id": 9999,
                                 "price": 200}, format="json")
        assert resp.status_code == 404

    @patch("stripe.checkout.Session.create", side_effect=Exception(
        "stripe down"))
    def test_create_rent_checkout_stripe_error(self, _, renter, rent):
        client = APIClient()
        url = reverse("create_checkout_session")
        resp = client.post(url, {"user_id": renter.id, "rent_id": rent.id,
                                 "price": 200}, format="json")
        assert resp.status_code == 400

    def test_pay_with_balance_success(self, renter, rent):
        PaidPendingConfirmation.objects.filter(rent=rent).delete()
        client = APIClient()
        url = reverse("pay_with_balance")
        payload = {"user_id": renter.id, "rent_id": rent.id, "price": "200"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        assert resp.status_code == 200

    def test_pay_with_balance_insufficient(self, renter, rent):
        renter.saldo = Decimal("0")
        renter.save()
        client = APIClient()
        url = reverse("pay_with_balance")
        payload = {"user_id": renter.id, "rent_id": rent.id, "price": "100"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        assert resp.status_code == 400

    def test_pay_with_balance_user_not_found(self, rent):
        client = APIClient()
        url = reverse("pay_with_balance")
        payload = {"user_id": 9999, "rent_id": rent.id, "price": "100"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        assert resp.status_code == 404

    def test_pay_with_balance_rent_not_found(self, renter):
        client = APIClient()
        url = reverse("pay_with_balance")
        payload = {"user_id": renter.id, "rent_id": 9999, "price": "100"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        assert resp.status_code == 404

    @patch("pagos.views.User.objects.get", side_effect=Exception("db error"))
    def test_pay_with_balance_generic_error(self, _, renter, rent):
        client = APIClient()
        url = reverse("pay_with_balance")
        payload = {"user_id": renter.id, "rent_id": rent.id, "price": "100"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        assert resp.status_code == 500

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_rent_checkout_success(self, mock_retrieve, renter, rent):
        mock_retrieve.return_value = type("S", (), {"payment_status": "paid",
                                                    "metadata": {
                                                        "rent_id": rent.id,
                                                        "user_id": renter.id}})
        client = APIClient()
        url = reverse("confirmar_pago", args=["sess_123"])
        resp = client.get(url)
        assert resp.status_code == 200

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_rent_checkout_unpaid(self, mock_retrieve):
        mock_retrieve.return_value = type("S", (),
                                          {"payment_status": "unpaid"})
        client = APIClient()
        url = reverse("confirmar_pago", args=["sess_123"])
        resp = client.get(url)
        assert resp.status_code == 402

    @patch("stripe.checkout.Session.retrieve",
           side_effect=Exception("stripe exploded"))
    def test_confirm_rent_checkout_exception(self, mock_retrieve):
        client = APIClient()
        url = reverse("confirmar_pago", args=["sess_123"])
        resp = client.get(url)
        assert resp.status_code == 400

    def test_set_renter_confirmation_no_record(self, rent):
        PaidPendingConfirmation.objects.filter(rent=rent).delete()
        client = APIClient()
        url = reverse("set_renter_confirmation")
        resp = client.post(url, {"rent_id": rent.id,
                                 "user_id": rent.renter.id}, format="json")
        assert resp.status_code == 404

    def test_set_renter_confirmation_owner(self, rent):
        PaidPendingConfirmation.objects.create(rent=rent)
        client = APIClient()
        url = reverse("set_renter_confirmation")
        resp = client.post(url, {"rent_id": rent.id,
                                 "user_id": rent.item.user.id}, format="json")
        assert resp.status_code == 200

    def test_process_pending_confirmations_valid(self, rent, monkeypatch):
        PaidPendingConfirmation.objects.create(rent=rent)
        rent.payment_status = PaymentStatus.PAID
        rent.end_date = now() - timedelta(days=3)
        rent.save()
        monkeypatch.setattr("pagos.views.SCHEDULER_TOKEN", "test_token")
        client = APIClient()
        url = reverse("process_pending_confirmations")
        resp = client.post(url, {"token": "test_token"}, format="json")
        assert resp.status_code == 200

    def test_process_payment_confirmation_valid(self, rent):
        PaidPendingConfirmation.objects.create(rent=rent)
        confirmation = rent.paid_pending_confirmation
        confirmation.is_confirmed_by_renter = True
        confirmation.is_confirmed_by_owner = True
        confirmation.save()

        from pagos.views import process_payment_confirmation
        result = process_payment_confirmation(confirmation)

        assert result["status"] == "success"

    def test_process_payment_confirmation_invalid(self):
        class Dummy:
            is_confirmed_by_renter = False
        from pagos.views import process_payment_confirmation
        with pytest.raises(Exception):
            process_payment_confirmation(Dummy())

    def test_withdraw_saldo_success(self, owner):
        client = APIClient()
        url = reverse("withdraw_saldo", args=[owner.id])
        payload = {"amount": "10"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        data = resp.json()

        assert resp.status_code == 200
        assert data["status"] == "success"
        assert "nuevo_saldo" in data

    def test_withdraw_saldo_insufficient_balance(self, owner):
        client = APIClient()
        url = reverse("withdraw_saldo", args=[owner.id])
        payload = {"amount": "9999"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        data = resp.json()

        assert resp.status_code == 400
        assert "Saldo insuficiente" in data["error"]

    def test_withdraw_saldo_amount_zero(self, owner):
        client = APIClient()
        url = reverse("withdraw_saldo", args=[owner.id])
        payload = {"amount": "0"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        data = resp.json()

        assert resp.status_code == 400
        assert "mayor que cero" in data["error"]

    def test_withdraw_saldo_amount_below_minimum(self, owner):
        client = APIClient()
        url = reverse("withdraw_saldo", args=[owner.id])
        payload = {"amount": "3"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        data = resp.json()

        assert resp.status_code == 400
        assert "mínima a retirar" in data["error"]

    def test_withdraw_saldo_user_not_found(self):
        client = APIClient()
        url = reverse("withdraw_saldo", args=[9999])
        payload = {"amount": "10"}
        resp = client.post(url, json.dumps(payload),
                           content_type="application/json")
        data = resp.json()

        assert resp.status_code == 404
        assert "Usuario no encontrado" in data["error"]

    def test_withdraw_saldo_generic_exception(self, owner):
        client = APIClient()

        with patch("pagos.views.User.objects.get",
                   side_effect=Exception("Fallo inesperado")):
            url = reverse("withdraw_saldo", args=[owner.id])
            payload = {"amount": "10"}
            resp = client.post(url, json.dumps(payload),
                               content_type="application/json")
            data = resp.json()

            assert resp.status_code == 500
            assert "Fallo inesperado" in data["error"]


@pytest.mark.django_db
class TestConfirmSubscriptionCheckout:

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_subscription_checkout_success(self, mock_retrieve,
                                                   renter):
        mock_retrieve.return_value = type("S", (), {
            "payment_status": "paid",
            "metadata": {"user_id": renter.id},
            "customer": "cus_test",
            "subscription": "sub_test",
        })
        client = APIClient()
        url = reverse("confirm_subscription_checkout", args=["sess_123"])
        resp = client.get(url)

        assert resp.status_code == 200
        assert resp.json()["status"] == "success"

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_subscription_checkout_unpaid(self, mock_retrieve):
        mock_retrieve.return_value = type("S", (), {
            "payment_status": "unpaid",
            "metadata": {}
        })
        client = APIClient()
        url = reverse("confirm_subscription_checkout", args=["sess_123"])
        resp = client.get(url)

        assert resp.status_code == 402
        assert resp.json()["status"] == "unpaid"

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_subscription_checkout_missing_user_id(self,
                                                           mock_retrieve):
        mock_retrieve.return_value = type("S", (), {
            "payment_status": "paid",
            "metadata": {}
        })
        client = APIClient()
        url = reverse("confirm_subscription_checkout", args=["sess_123"])
        resp = client.get(url)

        assert resp.status_code == 400
        assert "user_id no encontrado" in resp.json()["error"]

    @patch("stripe.checkout.Session.retrieve")
    def test_confirm_subscription_checkout_user_not_found(self, mock_retrieve):
        mock_retrieve.return_value = type("S", (), {
            "payment_status": "paid",
            "metadata": {"user_id": 9999}
        })
        client = APIClient()
        url = reverse("confirm_subscription_checkout", args=["sess_123"])
        resp = client.get(url)

        assert resp.status_code == 404
        assert "Usuario no encontrado" in resp.json()["error"]

    @patch("stripe.checkout.Session.retrieve", side_effect=Exception(
        "Stripe caído"))
    def test_confirm_subscription_checkout_exception(self, mock_retrieve):
        client = APIClient()
        url = reverse("confirm_subscription_checkout", args=["sess_123"])
        resp = client.get(url)

        assert resp.status_code == 400
        assert "Stripe caído" in resp.json()["error"]


@pytest.mark.django_db
class TestPayWithSaldo:

    def setup_method(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username="owner",
                                              email="owner@test.com",
                                              password="1234")
        self.owner.saldo = Decimal("100.00")
        self.owner.save()

    def test_pay_with_saldo_success(self):
        url = reverse("pay_with_saldo", args=[self.owner.id])
        payload = {"amount": "10.00"}
        resp = self.client.post(url, json.dumps(payload),
                                content_type="application/json")

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert "new_balance" in data

    def test_pay_with_saldo_insufficient_balance(self):
        self.owner.saldo = Decimal("5")
        self.owner.save()

        url = reverse("pay_with_saldo", args=[self.owner.id])
        payload = {"amount": "50.00"}
        resp = self.client.post(url, json.dumps(payload),
                                content_type="application/json")

        assert resp.status_code == 400
        assert "Saldo insuficiente" in resp.json()["error"]

    def test_pay_with_saldo_user_not_found(self):
        url = reverse("pay_with_saldo", args=[9999])
        payload = {"amount": "10.00"}
        resp = self.client.post(url, json.dumps(payload),
                                content_type="application/json")

        assert resp.status_code == 404
        assert "Usuario no encontrado" in resp.json()["error"]

    @patch("pagos.views.User.objects.get",
           side_effect=Exception("Fallo inesperado"))
    def test_pay_with_saldo_generic_error(self, mock_get):
        url = reverse("pay_with_saldo", args=[self.owner.id])
        payload = {"amount": "10.00"}
        resp = self.client.post(url, json.dumps(payload),
                                content_type="application/json")

        assert resp.status_code == 500
        assert "Fallo inesperado" in resp.json()["error"]
