from datetime import timedelta
from unittest.mock import patch
import uuid
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils.timezone import now
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.exceptions import ValidationError
from tickets.models import Ticket, TicketStatus, TicketImage
from tickets.serializers import TicketSerializer
from objetos.models import Item, ItemCategory, CancelType, PriceCategory
from rentas.models import Rent
from pagos.models import PaidPendingConfirmation  # Import necesario


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def customer(django_user_model):
    return django_user_model.objects.create_user(
        username="cliente", email="cliente@test.com", password="pass"
    )


@pytest.fixture
def admin(django_user_model):
    return django_user_model.objects.create_user(
        username="admin", email="admin@test.com", password="pass",
        is_admin=True
    )


@pytest.fixture
def rent(customer):
    item = Item.objects.create(
        title="Taladro",
        description="Taladro Bosch",
        user=customer,
        category=ItemCategory.DIY,
        subcategory="manual_tools",
        cancel_type=CancelType.FLEXIBLE,
        price_category=PriceCategory.DAY,
        price=10,
        deposit=0,
    )
    return Rent.objects.create(
        item=item,
        start_date=now(),
        end_date=now() + timedelta(days=1),
        total_price=10,
    )


@pytest.fixture
def rent_with_confirmation(rent):
    PaidPendingConfirmation.objects.create(rent=rent)
    return rent


@pytest.fixture(autouse=True)
def mock_imgbb_upload():
    with patch("tickets.serializers.upload_image_to_imgbb") as mocked:
        mocked.side_effect = lambda img: f"https://fakeimg/{uuid.uuid4()}.jpg"
        yield


def make_img():
    return SimpleUploadedFile("img.png", b"fake", content_type="image/png")


# Casos POSITIVOS
def test_create_ticket_success(client, customer, rent_with_confirmation):
    client.force_authenticate(user=customer)
    url = reverse("new_ticket", kwargs={"rentId": rent_with_confirmation.pk})
    resp = client.post(
        url,
        data={"description": "Se rompió", "image_files": [make_img()]},
        format="multipart",
    )
    assert resp.status_code == status.HTTP_201_CREATED
    ticket = Ticket.objects.get(pk=resp.data["id"])
    assert ticket.reporter == customer
    assert TicketImage.objects.filter(ticket=ticket).exists()


def test_admin_resolves_ticket_success(client, admin, customer, rent_with_confirmation):
    client.force_authenticate(user=customer)
    create_url = reverse("new_ticket", kwargs={"rentId": rent_with_confirmation.pk})
    client.post(create_url,
                data={"description": "Pantalla rota",
                      "image_files": [make_img()]},
                format="multipart")
    ticket = Ticket.objects.first()
    ticket.manager = admin
    ticket.save()

    client.force_authenticate(user=admin)
    update_url = reverse("incidencias-detail", kwargs={"pk": ticket.pk})
    resp = client.patch(update_url,
                        data={
                            "status": TicketStatus.RESOLVED,
                            "image_files": [make_img()],
                        },
                        format="multipart")
    assert resp.status_code == status.HTTP_200_OK
    ticket.refresh_from_db()
    assert ticket.status == TicketStatus.RESOLVED


# Casos NEGATIVOS
def test_create_ticket_without_images_error(client, customer, rent_with_confirmation):
    client.force_authenticate(user=customer)
    url = reverse("new_ticket", kwargs={"rentId": rent_with_confirmation.pk})
    resp = client.post(url, data={"description": "Sin fotos"},
                       format="multipart")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "image_files" in resp.data


def test_create_ticket_without_rent_error(client, customer):
    client.force_authenticate(user=customer)
    url = reverse("incidencias-list")
    resp = client.post(
        url,
        data={"description": "Sin rent", "image_files": [make_img()]},
        format="multipart",
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in resp.data


def test_serializer_missing_rent_raises_validation_error(client, customer):
    data = {"description": "desc", "image_files": [make_img()]}
    context = {"request": client}
    serializer = TicketSerializer(data=data, context=context)
    with pytest.raises(ValidationError):
        serializer.is_valid(raise_exception=True)


def test_duplicate_ticket_error(client, customer, rent_with_confirmation):
    client.force_authenticate(user=customer)
    url = reverse("new_ticket", kwargs={"rentId": rent_with_confirmation.pk})

    client.post(
        url,
        data={"description": "Primero", "image_files": [make_img()]},
        format="multipart",
    )

    resp = client.post(
        url,
        data={"description": "Duplicado", "image_files": [make_img()]},
        format="multipart",
    )

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "ticket" in resp.data


def test_non_admin_cannot_change_status_error(client, customer, rent_with_confirmation):
    client.force_authenticate(user=customer)
    create_url = reverse("new_ticket", kwargs={"rentId": rent_with_confirmation.pk})
    res_create = client.post(create_url,
                             data={"description": "Algo",
                                   "image_files": [make_img()]},
                             format="multipart")
    ticket_id = res_create.data["id"]

    update_url = reverse("incidencias-detail", kwargs={"pk": ticket_id})
    resp = client.patch(update_url,
                        data={
                            "status": TicketStatus.RESOLVED,
                            "image_files": [make_img()],
                        },
                        format="multipart")

    assert resp.status_code == status.HTTP_200_OK
    ticket = Ticket.objects.get(pk=ticket_id)
    assert ticket.status == TicketStatus.PENDING


def test_unauthenticated_cannot_create_ticket(client, rent_with_confirmation):
    url = reverse("new_ticket", kwargs={"rentId": rent_with_confirmation.pk})
    resp = client.post(
        url,
        data={"description": "No auth", "image_files": [make_img()]},
        format="multipart",
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_non_admin_delete_forbidden(client, customer, admin, rent_with_confirmation):
    client.force_authenticate(user=customer)
    create_url = reverse("new_ticket", kwargs={"rentId": rent_with_confirmation.pk})
    client.post(
        create_url,
        data={"description": "Del", "image_files": [make_img()]},
        format="multipart",
    )
    ticket = Ticket.objects.first()
    client.force_authenticate(user=customer)
    delete_url = reverse("incidencias-detail", kwargs={"pk": ticket.pk})
    resp = client.delete(delete_url)
    assert resp.status_code == status.HTTP_403_FORBIDDEN


# Casos DESTRUCTIVOS
def test_admin_delete_ticket_destructive(client, admin, customer, rent_with_confirmation):
    client.force_authenticate(user=customer)
    create_url = reverse("new_ticket", kwargs={"rentId": rent_with_confirmation.pk})
    client.post(
        create_url,
        data={"description": "Eliminarme", "image_files": [make_img()]},
        format="multipart",
    )
    ticket = Ticket.objects.first()
    ticket.manager = admin
    ticket.save()

    client.force_authenticate(user=admin)
    delete_url = reverse("incidencias-detail", kwargs={"pk": ticket.pk})
    resp = client.delete(delete_url)

    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert not Ticket.objects.filter(pk=ticket.pk).exists()


def test_ticket_image_view_success_and_not_found(client, customer, rent_with_confirmation):
    client.force_authenticate(user=customer)
    url = reverse("new_ticket", kwargs={"rentId": rent_with_confirmation.pk})
    res = client.post(
        url,
        data={"description": "Img", "image_files": [make_img()]},
        format="multipart",
    )
    img_id = TicketImage.objects.get(ticket_id=res.data["id"]).pk

    ok_url = reverse("ticket-image", kwargs={"pk": img_id})
    resp_ok = client.get(ok_url)
    assert resp_ok.status_code == status.HTTP_200_OK

    not_found_url = reverse("ticket-image", kwargs={"pk": img_id + 999})
    resp_nf = client.get(not_found_url)
    assert resp_nf.status_code == status.HTTP_404_NOT_FOUND
