from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class WantedItem(models.Model):
    """Items that users are looking to buy/request"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wanted_items")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    max_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Maximum price willing to pay")
    category = models.CharField(max_length=100, blank=True)
    condition_preference = models.CharField(max_length=50, choices=[
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('any', 'Any'),
    ], default='any')
    contact_phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user.username}"

