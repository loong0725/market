from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Item
        fields = (
            "id", "owner", "owner_username", "title", "description", "price",
            "category", "image_url", "image_urls", "is_available", "is_barter", "allow_barter", "is_featured", "desired_item",
            "condition", "location", "contact_phone", "created_at",
        )
        read_only_fields = ("owner", "created_at")
