from rest_framework import serializers
from .models import BarterTransaction

class BarterSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source="requester.username", read_only=True)
    responder_username = serializers.CharField(source="responder.username", read_only=True)

    class Meta:
        model = BarterTransaction
        fields = (
            "id", "requester", "requester_username",
            "responder", "responder_username",
            "item_offered", "item_requested",
            "status", "created_at",
        )
        read_only_fields = ("status", "created_at")
