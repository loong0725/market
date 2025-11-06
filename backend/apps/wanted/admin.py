from django.contrib import admin
from .models import WantedItem

@admin.register(WantedItem)
class WantedItemAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "max_price", "category", "is_active", "created_at")
    search_fields = ("title", "user__username", "description")
    list_filter = ("is_active", "category", "condition_preference")

