import random
from django.core.management.base import BaseCommand
from usuarios.models import User
from objetos.models import Item, ItemImage
from decimal import Decimal


class Command(BaseCommand):
    help = 'Generate seed data for DB'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Seed completed successfully!'))

    def create_users(self):
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
        self.stdout.write(self.style.SUCCESS('Users created successfully!'))

    def create_items(self):
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
                stock=random.randint(1, 100),
                is_active=bool(random.getrandbits(1)),
                user=random.choice(users)
            )
            ItemImage.objects.create(
                item=item
            )
        self.stdout.write(self.style.SUCCESS('Items created successfully!'))
