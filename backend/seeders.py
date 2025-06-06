# flake8: noqa
import string
import django
import os


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'borroo.settings')
django.setup()

from datetime import datetime
from django.contrib.auth.hashers import make_password
from decimal import Decimal
from rentas.models import PaymentStatus, Rent, RentStatus
from objetos.models import Item, ItemImage, ItemSubcategory
from usuarios.models import User
import random
from django.utils import timezone


def clear_database():
    confirmation = input(
        "¿Estás seguro de que deseas borrar todos los datos de la base de datos? (y/n): ")
    if confirmation.lower() == 'y' or confirmation.lower() == 'yes':
        Rent.objects.all().delete()
        ItemImage.objects.all().delete()
        Item.objects.all().delete()
        User.objects.all().delete()
        print("Todos los datos han sido borrados de la base de datos.")
    else:
        print("Operación cancelada.")
        exit()


def create_users():
    from django.utils.timezone import now, timedelta

    dnis = [
        "12345671A",
        "23456782B",
        "34567893C",
        "45678904D",
        "56789015E"
    ]
    
    usernames = ['User1', 'User2', 'User3', 'User4', 'User5']
    
    for i in range(5):
        pricing_plan = random.choice(['free', 'premium'])

        # Fechas según el plan
        if pricing_plan == 'premium':
            start_date = now()
            end_date = now() + timedelta(days=30)
        else:
            start_date = None
            end_date = None

        User.objects.create(
            username=usernames[i],
            name=f'{usernames[i]} Name',
            surname=f'{usernames[i]} Surname',
            email=f'{usernames[i].lower()}@example.com',
            password=make_password('Borroo_25'),
            phone_number=f'+123456789{i}',
            country='España',
            city='Madrid',
            address=f'Calle {i}',
            verified_account=True,
            postal_code='28001',
            dni=dnis[i],
            is_verified=bool(random.getrandbits(1)),
            pricing_plan=pricing_plan,
            subscription_start_date=start_date,
            subscription_end_date=end_date,
            is_admin=False
        )
    
    print('Users created successfully!')

    # Crear el superusuario siempre en premium
    superuser = User.objects.create(
        username='admin',
        name='Admin',
        surname='Admin',
        email='borrooclockify@gmail.com',
        password=make_password('Admin_25'),
        phone_number='+1234567890',
        country='España',
        city='Madrid',
        address='Calle Admin',
        postal_code='28001',
        dni='11223344Z',
        verified_account=True,
        is_verified=True,
        pricing_plan='premium',
        subscription_start_date=now(),
        subscription_end_date=now() + timedelta(days=30),
        is_admin=True,
    )


def create_items():
    users = User.objects.all()
    for i in range(10):
        item = Item.objects.create(
            title=f'Objeto {i}',
            description=f'Descripción del objeto {i}',
            category=random.choice(['technology', 'sports', 'diy',
                                    'clothing', 'furniture_and_logistics',
                                    'entertainment']),
            subcategory=ItemSubcategory.NONE,
            cancel_type=random.choice(['flexible', 'medium', 'strict']),
            price_category=random.choice(['hour', 'day', 'month']),
            price=Decimal(random.uniform(2, 30)),
            deposit=Decimal(random.uniform(30, 100)),
            user=random.choice(users),
            draft_mode=False,
            featured=False,
            num_likes=0
        )
    print('Items created successfully!')


def create_rents():
    item1 = Item.objects.first()
    item2 = Item.objects.last()
    renter1 = User.objects.first()
    renter2 = User.objects.last()

    Rent.objects.create(
        item=item1,
        renter=renter1,
        start_date=timezone.now(),
        end_date=timezone.now() + timezone.timedelta(days=7),
        rent_status=RentStatus.ACCEPTED,
        payment_status=PaymentStatus.PAID,
        total_price=100.0,
        commission=10.0
    )

    Rent.objects.create(
        item=item2,
        renter=renter2,
        start_date=timezone.now() - timezone.timedelta(days=2),
        end_date=timezone.now() + timezone.timedelta(days=5),
        rent_status=RentStatus.REQUESTED,
        payment_status=PaymentStatus.PENDING,
        total_price=200.0,
        commission=20.0
    )

    Rent.objects.create(
        item=item1,
        renter=renter2,
        start_date=timezone.now() - timezone.timedelta(days=10),
        end_date=timezone.now() - timezone.timedelta(days=3),
        rent_status=RentStatus.CANCELLED,
        payment_status=PaymentStatus.PAID,
        total_price=150.0,
        commission=15.0
    )
    print('Rent created successfully!')

if __name__ == '__main__':
    clear_database()
    create_users()
    create_items()
    create_rents()
    print('Seeders completed successfully!')