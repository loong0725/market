from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('order_created', 'Order Created'),
        ('order_updated', 'Order Updated'),
        ('order_cancelled', 'Order Cancelled'),
        ('payment_received', 'Payment Received'),
        ('item_sold', 'Item Sold'),
        ('barter_request', 'Barter Request'),
        ('barter_accepted', 'Barter Accepted'),
        ('barter_rejected', 'Barter Rejected'),
        ('message_received', 'Message Received'),
        ('forum_reply', 'Forum Reply'),
        ('system_announcement', 'System Announcement'),
        ('wishlist_match', 'Wishlist Match'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Related objects
    related_item_id = models.PositiveIntegerField(null=True, blank=True)
    related_order_id = models.PositiveIntegerField(null=True, blank=True)
    related_barter_id = models.PositiveIntegerField(null=True, blank=True)
    related_forum_post_id = models.PositiveIntegerField(null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            from django.utils import timezone
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

class NotificationSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    
    # Email notifications
    email_order_updates = models.BooleanField(default=True)
    email_payment_updates = models.BooleanField(default=True)
    email_barter_updates = models.BooleanField(default=True)
    email_messages = models.BooleanField(default=True)
    email_forum_replies = models.BooleanField(default=True)
    email_system_announcements = models.BooleanField(default=True)
    
    # Push notifications
    push_order_updates = models.BooleanField(default=True)
    push_payment_updates = models.BooleanField(default=True)
    push_barter_updates = models.BooleanField(default=True)
    push_messages = models.BooleanField(default=True)
    push_forum_replies = models.BooleanField(default=True)
    push_system_announcements = models.BooleanField(default=True)
    
    # In-app notifications
    in_app_order_updates = models.BooleanField(default=True)
    in_app_payment_updates = models.BooleanField(default=True)
    in_app_barter_updates = models.BooleanField(default=True)
    in_app_messages = models.BooleanField(default=True)
    in_app_forum_replies = models.BooleanField(default=True)
    in_app_system_announcements = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification settings for {self.user.username}"

class NotificationTemplate(models.Model):
    notification_type = models.CharField(max_length=30, choices=Notification.NOTIFICATION_TYPES, unique=True)
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    email_subject_template = models.CharField(max_length=200, blank=True)
    email_body_template = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Template for {self.notification_type}"
