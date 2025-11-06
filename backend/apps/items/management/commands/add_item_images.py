from django.core.management.base import BaseCommand
from apps.items.models import Item

class Command(BaseCommand):
    help = 'Add sample images to existing items'

    def handle(self, *args, **options):
        # Image URLs from Unsplash (free stock photos)
        # Using different categories for different item types
        image_map = {
            'Introduction to Computer Science Textbook': [
                'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            ],
            'Engineering Mathematics Reference Book': [
                'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
            ],
            'Electric Kettle - Stainless Steel': [
                'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1609004555492-25924c5e0e5a?w=400&h=300&fit=crop',
            ],
            'Study Desk Lamp with USB Charging': [
                'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
            ],
            'Mountain Bike - 26 inch': [
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop',
            ],
            'Guitar - Acoustic': [
                'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
            ],
            'Coffee Maker - Drip Style': [
                'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
            ],
            'Mini Refrigerator': [
                'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
            ],
            'Wireless Headphones - Over-ear': [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop',
            ],
            'Study Table with Drawers': [
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&h=300&fit=crop',
            ],
        }

        updated_count = 0
        for item in Item.objects.all():
            if item.title in image_map:
                item.image_urls = image_map[item.title]
                # Also set the first image as image_url for backward compatibility
                item.image_url = image_map[item.title][0]
                item.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'Updated: {item.title}'))
            elif not item.image_urls and not item.image_url:
                # For items not in the map, add a generic placeholder based on category
                category_images = {
                    'books': ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=300&fit=crop'],
                    'furniture': ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
                    'sports': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
                    'phone': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'],
                    'games': ['https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=300&fit=crop'],
                }
                default_image = ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop']
                item.image_urls = category_images.get(item.category, default_image)
                item.image_url = item.image_urls[0]
                item.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'Updated with category image: {item.title}'))

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully updated {updated_count} items with images'))


