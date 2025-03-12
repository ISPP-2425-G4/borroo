import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'borroo.settings')
django.setup()

import random
from usuarios.models import User
from objetos.models import Item, ItemImage
from decimal import Decimal


def create_users():
    for i in range(10):
        User.objects.create(
            username=f'usuario{i}',
            name=f'Usuario {i}',
            surname=f'Apellido {i}',
            email=f'usuario{i}@example.com',
            password='contraseña123',
            phone_number=f'+123456789{i}',
            country='España',
            city='Madrid',
            address=f'Calle {i}',
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
            user=random.choice(users)
        )
        ItemImage.objects.create(
            item=item
        )
    print('Items created successfully!')


if __name__ == '__main__':
    create_users()
    create_items()
    print('Seeders completed successfully!')
