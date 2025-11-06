from django.contrib import admin
from .models import Order, OrderItem

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'buyer', 'seller', 'item', 'total_price', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at', 'updated_at']
    search_fields = ['buyer__username', 'seller__username', 'item__title', 'payment_id']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ("Order Information", {
            "fields": ("buyer", "seller", "item", "quantity", "total_price")
        }),
        ("Status", {
            "fields": ("status", "payment_status")
        }),
        ("Payment Information", {
            "fields": ("payment_method", "payment_id")
        }),
        ("Shipping Information", {
            "fields": ("shipping_address", "notes")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'item', 'quantity', 'price']
    list_filter = ['order__status']
    search_fields = ['order__id', 'item__title']
