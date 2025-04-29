from decimal import Decimal
from datetime import timedelta
import pytest
from django.utils import timezone
from rest_framework.test import APIClient
from usuarios.models import User
from objetos.models import Item
from rentas.models import Rent, RentStatus, PaymentStatus
from rentas.views import apply_penalty, apply_refund
import rentas.views as rent_views


@pytest.fixture(autouse=True)
def _patch_anonymous_user(monkeypatch):
    class _FalseMeta(type):
        def __bool__(cls):
            return False

    class _FakeAnon(metaclass=_FalseMeta):
        """Dummy AnonymousUser replacement."""

    monkeypatch.setattr(rent_views, "AnonymousUser", _FakeAnon)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def owner(db):
    return User.objects.create_user("owner_ex", "o@example.com", "pass1234")


@pytest.fixture
def renter(db):
    return User.objects.create_user("renter_ex", "r@example.com", "pass1234")


@pytest.fixture
def item(owner):
    return Item.objects.create(
        title="Cámara",
        price=Decimal("40.00"),
        deposit=Decimal("5.00"),
        price_category="day",
        cancel_type="flexible",
        category="technology",
        subcategory="camera",
        user=owner,
    )


class TestHelperFunctions:
    def test_apply_penalty_adds_10_percent(self):
        class Dummy:
            total_price = 100.0

        d = Dummy()
        assert apply_penalty(d) == pytest.approx(110.0)
        assert d.total_price == 110.0

    @pytest.mark.parametrize(
        "cancel_type,days,expected",
        [
            ("flexible", 1, Decimal("1.00")),
            ("flexible", 0, Decimal("0.80")),
            ("medium", 3, Decimal("1.00")),
            ("medium", 1, Decimal("0.50")),
            ("strict", 10, Decimal("0.50")),
            ("strict", 5, Decimal("0.00")),
        ],
    )
    def test_apply_refund_thresholds(self, cancel_type, days, expected):
        assert apply_refund(cancel_type, days) == expected


@pytest.mark.django_db
class TestRentEndpoints:
    def setup_method(self):
        self.api_client = APIClient()

    def _create_rent(self, item, renter, status, total_days: int = 1,
                     offset_minutes: int = -10, paid=True):
        start = timezone.now() + timedelta(minutes=offset_minutes)
        end = start + timedelta(days=total_days)
        return Rent.objects.create(
            item=item,
            renter=renter,
            start_date=start,
            end_date=end,
            rent_status=status,
            payment_status=(
                PaymentStatus.PAID if paid else PaymentStatus.PENDING),
            total_price=float(item.price * (total_days + 1)),
        )

    def test_change_status_picked_up_refund_window(self, renter, item):
        rent = self._create_rent(item, renter, RentStatus.BOOKED,
                                 offset_minutes=-5)
        self.api_client.force_authenticate(user=renter)

        original_price = float(rent.total_price)
        url = f"/rentas/full/{rent.id}/change_status/"
        resp = self.api_client.put(url, {"response": "PICKED_UP"},
                                   format="json")

        rent.refresh_from_db()
        assert resp.status_code == 200
        assert rent.rent_status == RentStatus.PICKED_UP

        posibles = {original_price, round(original_price * 0.9, 2)}
        assert round(float(rent.total_price), 2) in posibles

    def test_change_status_returned_with_penalty(self, renter, owner, item):
        start = timezone.now() - timedelta(days=2)
        end = start + timedelta(days=1)
        rent = Rent.objects.create(
            item=item,
            renter=renter,
            start_date=start,
            end_date=end,
            rent_status=RentStatus.PICKED_UP,
            payment_status=PaymentStatus.PAID,
            total_price=float(item.price * 2),
        )

        self.api_client.force_authenticate(user=owner)
        url = f"/rentas/full/{rent.id}/change_status/"
        resp = self.api_client.put(url, {"response": "RETURNED"},
                                   format="json")

        if resp.status_code == 200:
            rent.refresh_from_db()
            assert rent.rent_status == RentStatus.RETURNED
            assert float(rent.total_price) >= float(item.price * 2)
        else:
            assert resp.status_code == 403

    def test_owner_cancels_booked_full_refund(self, owner, renter, item):
        rent = self._create_rent(item, renter, RentStatus.BOOKED,
                                 offset_minutes=60)
        self.api_client.force_authenticate(user=owner)

        url = f"/rentas/full/{rent.id}/cancel_rent/"
        resp = self.api_client.put(url, format="json")

        rent.refresh_from_db()
        assert resp.status_code == 200
        assert rent.rent_status == RentStatus.CANCELLED
        assert resp.data["refund_percentage"] == "1.00"
        assert resp.data["cancelled_by"] == "owner"

    def test_cancel_expired_rents_scheduler(self, renter, item, monkeypatch):
        past_start = timezone.now() - timedelta(days=1)
        past_end = past_start + timedelta(days=1)
        Rent.objects.create(
            item=item,
            renter=renter,
            start_date=past_start,
            end_date=past_end,
            rent_status=RentStatus.REQUESTED,
        )

        monkeypatch.setattr(rent_views, "SCHEDULER_TOKEN", "testtoken")
        url = "/rentas/full/cancel-expired-rents/"
        resp = self.api_client.post(url, {"token": "testtoken"}, format="json")

        assert resp.status_code == 200
        assert Rent.objects.filter(
            rent_status=RentStatus.CANCELLED).count() == 1

    def test_has_rented_from_false(self, renter, owner):
        url = "/rentas/full/has-rented-from/"
        resp = self.api_client.get(url, {"renter": renter.username,
                                         "owner": owner.username})

        assert resp.status_code == 200
        assert resp.data["has_rented"] is False

    def test_renter_cancels_booked_with_partial_refund(self, renter, item):
        renter.saldo = Decimal("0.00")
        renter.save()

        rent = Rent.objects.create(
            item=item,
            renter=renter,
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=2),
            rent_status=RentStatus.BOOKED,
            payment_status=PaymentStatus.PAID,
            total_price=100.00,
        )
        self.api_client.force_authenticate(user=renter)
        url = f"/rentas/full/{rent.id}/cancel_rent/"
        resp = self.api_client.put(url, format="json")

        assert resp.status_code == 200
        rent.refresh_from_db()
        assert rent.rent_status == RentStatus.CANCELLED
        assert resp.data["cancelled_by"] == "renter"
        assert "refund_percentage" in resp.data

    def test_cancel_rent_invalid_status(self, renter, item):
        rent = Rent.objects.create(
            item=item,
            renter=renter,
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=2),
            rent_status=RentStatus.RETURNED,
            payment_status=PaymentStatus.PAID,
            total_price=100.00,
        )
        self.api_client.force_authenticate(user=renter)
        url = f"/rentas/full/{rent.id}/cancel_rent/"
        resp = self.api_client.put(url, format="json")

        assert resp.status_code == 400
        assert "error" in resp.data

    def test_destroy_by_renter_only(self, renter, owner, item):
        rent = Rent.objects.create(
            item=item,
            renter=renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=1),
            rent_status=RentStatus.REQUESTED,
        )

        self.api_client.force_authenticate(user=renter)
        url = f"/rentas/full/{rent.id}/"
        resp = self.api_client.delete(url)

        assert resp.status_code in (204, 200)
        assert not Rent.objects.filter(pk=rent.pk).exists()

    def test_destroy_by_non_renter_forbidden(self, owner, renter, item):
        rent = Rent.objects.create(
            item=item,
            renter=renter,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=1),
            rent_status=RentStatus.REQUESTED,
        )

        self.api_client.force_authenticate(user=owner)
        url = f"/rentas/full/{rent.id}/"
        resp = self.api_client.delete(url)

        assert resp.status_code == 403
