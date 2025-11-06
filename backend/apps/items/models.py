from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Item(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="items")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    category = models.CharField(max_length=100, blank=True)  # Keep for backward compatibility
    category_new = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    image_url = models.URLField(null=True, blank=True, help_text="Deprecated: Use image_urls for multiple images")
    image_urls = models.JSONField(default=list, blank=True, help_text="Array of image URLs (base64 data URLs or external URLs)")
    is_available = models.BooleanField(default=True)
    is_barter = models.BooleanField(default=False, help_text="Item is primarily for barter (no price)")
    allow_barter = models.BooleanField(default=False, help_text="Item can be exchanged even if it has a price")
    is_featured = models.BooleanField(default=False, help_text="Featured items shown on featured page (requires membership)")
    desired_item = models.CharField(max_length=200, blank=True, null=True)
    condition = models.CharField(max_length=50, choices=[
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ], default='good')
    location = models.CharField(max_length=200, blank=True)
    contact_phone = models.CharField(max_length=50, blank=True, help_text="Contact information for buyers")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title}"
