from django.core.management.base import BaseCommand
from apps.items.models import Item
from apps.users.models import User
from decimal import Decimal


class Command(BaseCommand):
    help = 'Add sample campus items (books, daily necessities, bicycles, etc.)'

    def handle(self, *args, **options):
        # Get or create user 111
        user, created = User.objects.get_or_create(
            id=111,
            defaults={
                'username': 'campus_user_111',
                'email': 'user111@ait.ac.th',
                'ait_email': 'user111@ait.ac.th',
                'first_name': 'Campus',
                'last_name': 'User',
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created user {user.username} (ID: {user.id})'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Using existing user {user.username} (ID: {user.id})'))

        # Get another user for other items (or create one)
        other_user = User.objects.first()
        if other_user is None or other_user.id == user.id:
            other_user, _ = User.objects.get_or_create(
                username='sample_user',
                defaults={
                    'email': 'sample@ait.ac.th',
                    'ait_email': 'sample@ait.ac.th',
                    'first_name': 'Sample',
                    'last_name': 'User',
                }
            )
            if not other_user.has_usable_password():
                other_user.set_password('password123')
                other_user.save()

        # Sample items data
        items_data = [
            # Books
            {
                'owner': other_user,
                'title': 'Introduction to Computer Science Textbook',
                'description': 'Used textbook for CS101 course. Good condition with minimal highlighting. 3rd edition.',
                'price': Decimal('450.00'),
                'category': 'books',
                'condition': 'good',
                'location': 'AIT Campus',
                'contact_phone': '+66 81 234 5678',
                'is_barter': False,
            },
            {
                'owner': other_user,
                'title': 'Engineering Mathematics Reference Book',
                'description': 'Comprehensive math reference book. Like new condition, barely used.',
                'price': Decimal('600.00'),
                'category': 'books',
                'condition': 'like_new',
                'location': 'AIT Campus',
                'contact_phone': '+66 81 234 5678',
                'is_barter': False,
            },
            # Daily Necessities
            {
                'owner': other_user,
                'title': 'Electric Kettle - Stainless Steel',
                'description': '1.7L capacity electric kettle. Perfect for dorm room. Works great, selling because moving out.',
                'price': Decimal('350.00'),
                'category': 'furniture',
                'condition': 'good',
                'location': 'AIT Campus',
                'contact_phone': '+66 82 345 6789',
                'is_barter': False,
            },
            {
                'owner': other_user,
                'title': 'Study Desk Lamp with USB Charging',
                'description': 'LED desk lamp with adjustable brightness and USB charging port. Excellent condition.',
                'price': Decimal('250.00'),
                'category': 'furniture',
                'condition': 'like_new',
                'location': 'AIT Campus',
                'contact_phone': '+66 82 345 6789',
                'is_barter': False,
            },
            # Bicycle
            {
                'owner': other_user,
                'title': 'Mountain Bike - 26 inch',
                'description': 'Well-maintained mountain bike. Good tires, brakes work perfectly. Some scratches from normal use.',
                'price': Decimal('1200.00'),
                'category': 'sports',
                'condition': 'good',
                'location': 'AIT Campus',
                'contact_phone': '+66 83 456 7890',
                'is_barter': False,
            },
            # Barter items
            {
                'owner': other_user,
                'title': 'Guitar - Acoustic',
                'description': 'Used acoustic guitar. Good sound quality. Some wear on the body but plays well.',
                'price': None,
                'category': 'games',
                'condition': 'fair',
                'location': 'AIT Campus',
                'contact_phone': '+66 84 567 8901',
                'is_barter': True,
                'desired_item': 'Laptop or iPad',
            },
            {
                'owner': other_user,
                'title': 'Coffee Maker - Drip Style',
                'description': '12-cup coffee maker. Works perfectly, just upgraded to a better one.',
                'price': None,
                'category': 'furniture',
                'condition': 'good',
                'location': 'AIT Campus',
                'contact_phone': '+66 85 678 9012',
                'is_barter': True,
                'desired_item': 'Books or Electronics',
            },
            {
                'owner': other_user,
                'title': 'Mini Refrigerator',
                'description': 'Small dorm fridge, 50L capacity. Perfect for keeping drinks cold. Works great.',
                'price': None,
                'category': 'furniture',
                'condition': 'good',
                'location': 'AIT Campus',
                'contact_phone': '+66 86 789 0123',
                'is_barter': True,
                'desired_item': 'Bicycle or Sports Equipment',
            },
            # Items for user 111
            {
                'owner': user,
                'title': 'Wireless Headphones - Over-ear',
                'description': 'Brand new wireless headphones. Still in original box. Bluetooth 5.0, noise cancellation.',
                'price': Decimal('800.00'),
                'category': 'phone',
                'condition': 'new',
                'location': 'AIT Campus',
                'contact_phone': '+66 81 234 5678',
                'is_barter': False,
            },
            {
                'owner': user,
                'title': 'Study Table with Drawers',
                'description': 'Wooden study table with 3 drawers. Good condition, minor scratches. Selling because moving.',
                'price': Decimal('500.00'),
                'category': 'furniture',
                'condition': 'good',
                'location': 'AIT Campus',
                'contact_phone': '+66 81 234 5678',
                'is_barter': False,
            },
        ]

        # Create items
        created_count = 0
        for item_data in items_data:
            item, created = Item.objects.get_or_create(
                owner=item_data['owner'],
                title=item_data['title'],
                defaults=item_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created: {item.title}'))
            else:
                self.stdout.write(self.style.WARNING(f'Already exists: {item.title}'))

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created {created_count} items'))
        self.stdout.write(self.style.SUCCESS(f'User 111 ({user.username}) has {user.items.count()} items'))

