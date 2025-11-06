from rest_framework import serializers
from .models import Notification, NotificationSettings, NotificationTemplate

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'priority',
            'related_item_id', 'related_order_id', 'related_barter_id', 'related_forum_post_id',
            'is_read', 'is_sent', 'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            'email_order_updates', 'email_payment_updates', 'email_barter_updates',
            'email_messages', 'email_forum_replies', 'email_system_announcements',
            'push_order_updates', 'push_payment_updates', 'push_barter_updates',
            'push_messages', 'push_forum_replies', 'push_system_announcements',
            'in_app_order_updates', 'in_app_payment_updates', 'in_app_barter_updates',
            'in_app_messages', 'in_app_forum_replies', 'in_app_system_announcements',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'notification_type', 'title_template', 'message_template',
            'email_subject_template', 'email_body_template', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
