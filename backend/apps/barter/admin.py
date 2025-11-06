from django.contrib import admin
from .models import BarterTransaction
@admin.register(BarterTransaction)
class BarterAdmin(admin.ModelAdmin):
    list_display = ("id", "requester", "responder", "item_offered", "item_requested", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("requester__username", "responder__username")
