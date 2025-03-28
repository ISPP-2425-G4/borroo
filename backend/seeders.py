# flake8: noqa
import django
import os


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'borroo.settings')
django.setup()

from datetime import datetime
from django.contrib.auth.hashers import make_password
from decimal import Decimal
from rentas.models import Rent
from objetos.models import Item, ItemImage, ItemSubcategory
from usuarios.models import User
import random


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
    usernames = ['User1', 'User2', 'User3', 'User4', 'User5']
    for username in usernames:
        User.objects.create(
            username=username,
            name=f'{username} Name',
            surname=f'{username} Surname',
            email=f'{username.lower()}@example.com',
            password=make_password('Borroo_25'),
            phone_number=f'+123456789{usernames.index(username)}',
            country='España',
            city='Madrid',
            address=f'Calle {usernames.index(username)}',
            postal_code='28001',
            is_verified=bool(random.getrandbits(1)),
            pricing_plan=random.choice(['free', 'premium']),
            is_admin=False
        )
    print('Users created successfully!')

    superuser = User.objects.create(
        username='admin',
        name='Admin',
        surname='Admin',
        email='admin@example.com',
        password=make_password('Admin_25'),
        phone_number='+1234567890',
        country='España',
        city='Madrid',
        address='Calle Admin',
        postal_code='28001',
        is_verified=True,
        pricing_plan='premium',
        is_admin=True
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
            user=random.choice(users),
            draft_mode=False,
            featured=False
        )
    print('Items created successfully!')


if __name__ == '__main__':
    clear_database()
    create_users()
    create_items()
    print('Seeders completed successfully!')