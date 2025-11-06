from django.contrib import admin
from .models import Advertisement, AdClick, AdView

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ['title', 'ad_type', 'status', 'position', 'click_count', 'view_count', 'is_active', 'created_by', 'created_at']
    list_filter = ['ad_type', 'status', 'position', 'created_at']
    search_fields = ['title', 'description', 'created_by__username']
    list_editable = ['status', 'position']
    readonly_fields = ['click_count', 'view_count', 'created_at', 'updated_at']
    
    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True
    is_active.short_description = 'Active'

@admin.register(AdClick)
class AdClickAdmin(admin.ModelAdmin):
    list_display = ['advertisement', 'user', 'ip_address', 'clicked_at']
    list_filter = ['clicked_at', 'advertisement__ad_type']
    search_fields = ['advertisement__title', 'user__username', 'ip_address']
    readonly_fields = ['clicked_at']

@admin.register(AdView)
class AdViewAdmin(admin.ModelAdmin):
    list_display = ['advertisement', 'user', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at', 'advertisement__ad_type']
    search_fields = ['advertisement__title', 'user__username', 'ip_address']
    readonly_fields = ['viewed_at']
