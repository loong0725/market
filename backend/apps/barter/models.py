from django.db import models
from django.conf import settings
from apps.items.models import Item

User = settings.AUTH_USER_MODEL

class BarterTransaction(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
    ]
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="barter_requests")
    responder = models.ForeignKey(User, on_delete=models.CASCADE, related_name="barter_responses")
    item_offered = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="offered_by_requester")
    item_requested = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="requested_from_responder")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.requester} -> {self.responder} [{self.status}]"
