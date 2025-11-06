from rest_framework import serializers
from .models import UserMembership
from django.utils import timezone
from datetime import timedelta

class UserMembershipSerializer(serializers.ModelSerializer):
    is_valid = serializers.ReadOnlyField()
    
    class Meta:
        model = UserMembership
        fields = ['id', 'user', 'start_date', 'end_date', 'is_active', 'price', 'is_valid']
        read_only_fields = ['id', 'start_date']

class CreateMembershipSerializer(serializers.Serializer):
    """Serializer for creating/updating membership"""
    months = serializers.IntegerField(default=1, min_value=1, max_value=12)
    
    def create(self, validated_data):
        user = self.context['request'].user
        months = validated_data.get('months', 1)
        
        # Check if user already has membership
        membership, created = UserMembership.objects.get_or_create(
            user=user,
            defaults={
                'end_date': timezone.now() + timedelta(days=months * 30),
                'price': 199.00 * months
            }
        )
        
        if not created:
            # Extend existing membership
            if membership.is_valid:
                # Extend from current end_date
                membership.end_date += timedelta(days=months * 30)
            else:
                # Start new period from now
                membership.end_date = timezone.now() + timedelta(days=months * 30)
            membership.price = 199.00 * months
            membership.is_active = True
            membership.save()
        
        return membership

