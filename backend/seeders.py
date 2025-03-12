import random
from django.core.management.base import BaseCommand
from usuarios.models import Usuario


class Command(BaseCommand):
    help = 'Generate seed data for DB'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Seed completed successfully!'))

    def create_users(self):
        for i in range(10):
            Usuario.objects.create(
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
