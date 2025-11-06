from django.contrib import admin
from .models import Notification, NotificationSettings, NotificationTemplate

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'notification_type', 'priority', 'is_read', 'is_sent', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'is_sent', 'created_at']
    search_fields = ['user__username', 'title', 'message']
    list_editable = ['is_read', 'is_sent']
    readonly_fields = ['created_at', 'read_at']

@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_order_updates', 'push_order_updates', 'in_app_order_updates', 'created_at']
    list_filter = ['email_order_updates', 'push_order_updates', 'in_app_order_updates', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['notification_type', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['notification_type', 'title_template']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at']
