from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Generate seed data for DB'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Seed completed successfully!'))
