from rest_framework import serializers
from .models import WantedItem

class WantedItemSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = WantedItem
        fields = (
            "id", "user", "user_username", "title", "description", "max_price",
            "category", "condition_preference", "contact_phone", "location",
            "is_active", "paid_amount", "is_free_post", "created_at", "updated_at",
        )
        read_only_fields = ("user", "created_at", "updated_at")

