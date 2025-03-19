# flake8: noqa
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'borroo.settings')
django.setup()

import random
from usuarios.models import User
from objetos.models import Item, ItemImage
from rentas.models import Rent
from decimal import Decimal
from django.contrib.auth.hashers import make_password
from datetime import datetime

def clear_database():
    confirmation = input("¿Estás seguro de que deseas borrar todos los datos de la base de datos? (y/n): ")
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
            pricing_plan=random.choice(['free', 'basic', 'premium'])
        )
    print('Users created successfully!')

def create_items():
    users = User.objects.all()
    for i in range(10):
        item = Item.objects.create(
            title=f'Objeto {i}',
            description=f'Descripción del objeto {i}',
            category=random.choice(['technology', 'sports', 'diy',
                                    'clothing', 'furniture_and_logistics',
                                    'training']),
            cancel_type=random.choice(['flexible', 'medium', 'strict']),
            price_category=random.choice(['hour', 'day', 'week', 'month',
                                          'year']),
            price=Decimal(random.uniform(2, 30)),
            user=random.choice(users),
            draft_mode=False,
        )
    print('Items created successfully!')

if __name__ == '__main__':
    clear_database()
    create_users()
    create_items()
    print('Seeders completed successfully!')
