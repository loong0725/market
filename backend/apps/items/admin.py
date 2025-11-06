from django.contrib import admin
from .models import Item

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "price", "is_barter", "is_featured", "is_available", "created_at")
    search_fields = ("title", "description", "owner__username")
    list_filter = ("is_barter", "is_featured", "is_available", "category", "condition", "created_at")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Basic Information", {
            "fields": ("owner", "title", "description", "category", "category_new")
        }),
        ("Price & Status", {
            "fields": ("price", "is_available", "is_barter", "is_featured", "desired_item")
        }),
        ("Details", {
            "fields": ("condition", "location", "contact_phone")
        }),
        ("Images", {
            "fields": ("image_url", "image_urls")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )
