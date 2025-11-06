from django.contrib.auth.models import AbstractUser
from django.db import models

def is_ait_email(email: str) -> bool:
    return email.endswith("@ait.ac.th")

class User(AbstractUser):
    ait_email = models.EmailField(unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=True, help_text="User email verification status (always True, no verification needed)")
    phone = models.CharField(max_length=50, blank=True, null=True, help_text="User phone number")
    bio = models.TextField(blank=True, null=True, help_text="User biography/description")


class UserMembership(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="membership")
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=199.00, help_text="Price in THB")
    
    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.user.username} - {self.end_date}"
    
    @property
    def is_valid(self):
        from django.utils import timezone
        return self.is_active and self.end_date > timezone.now()
