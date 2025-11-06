from rest_framework import serializers
from .models import Advertisement, AdClick, AdView

class AdvertisementSerializer(serializers.ModelSerializer):
    is_active = serializers.ReadOnlyField()
    click_through_rate = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Advertisement
        fields = [
            'id', 'title', 'description', 'ad_type', 'image_url', 'link_url',
            'status', 'target_categories', 'target_locations', 'start_date',
            'end_date', 'click_count', 'view_count', 'position', 'sort_order',
            'created_by', 'created_by_username', 'created_at', 'updated_at',
            'is_active', 'click_through_rate'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'click_count', 'view_count']

class AdvertisementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertisement
        fields = [
            'title', 'description', 'ad_type', 'image_url', 'link_url',
            'target_categories', 'target_locations', 'start_date', 'end_date',
            'position', 'sort_order'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class AdClickSerializer(serializers.ModelSerializer):
    advertisement_title = serializers.CharField(source='advertisement.title', read_only=True)
    
    class Meta:
        model = AdClick
        fields = [
            'id', 'advertisement', 'advertisement_title', 'user', 'ip_address',
            'user_agent', 'referer', 'clicked_at'
        ]
        read_only_fields = ['id', 'clicked_at']

class AdViewSerializer(serializers.ModelSerializer):
    advertisement_title = serializers.CharField(source='advertisement.title', read_only=True)
    
    class Meta:
        model = AdView
        fields = [
            'id', 'advertisement', 'advertisement_title', 'user', 'ip_address',
            'user_agent', 'page_url', 'viewed_at'
        ]
        read_only_fields = ['id', 'viewed_at']

class AdvertisementStatsSerializer(serializers.ModelSerializer):
    click_through_rate = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Advertisement
        fields = [
            'id', 'title', 'ad_type', 'status', 'click_count', 'view_count',
            'click_through_rate', 'is_active', 'start_date', 'end_date'
        ]
