from django.contrib import admin
from .models import PaymentMethod, Payment, PaymentRefund, PaymentWebhook

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['user', 'payment_type', 'name', 'is_default', 'is_active', 'created_at']
    list_filter = ['payment_type', 'is_default', 'is_active', 'created_at']
    search_fields = ['user__username', 'name']
    list_editable = ['is_default', 'is_active']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'order', 'amount', 'currency', 'status', 'provider', 'created_at']
    list_filter = ['status', 'provider', 'currency', 'created_at']
    search_fields = ['user__username', 'order__id', 'provider_transaction_id']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']

@admin.register(PaymentRefund)
class PaymentRefundAdmin(admin.ModelAdmin):
    list_display = ['id', 'payment', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['payment__id', 'reason']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']

@admin.register(PaymentWebhook)
class PaymentWebhookAdmin(admin.ModelAdmin):
    list_display = ['id', 'provider', 'event_type', 'processed', 'created_at']
    list_filter = ['provider', 'processed', 'created_at']
    search_fields = ['provider', 'event_type']
    list_editable = ['processed']
    readonly_fields = ['created_at']
