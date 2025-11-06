from django.contrib import admin
from .models import Address

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'recipient_name', 'city', 'is_default', 'is_active', 'created_at']
    list_filter = ['address_type', 'is_default', 'is_active', 'city', 'created_at']
    search_fields = ['user__username', 'recipient_name', 'address_line_1', 'city']
    list_editable = ['is_default', 'is_active']
    readonly_fields = ['created_at', 'updated_at']
