from django.contrib import admin
from .models import Wishlist, WishlistItem, WantToBuy

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email']

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['wishlist', 'item', 'added_at']
    list_filter = ['added_at', 'wishlist__user']
    search_fields = ['wishlist__user__username', 'item__title']

@admin.register(WantToBuy)
class WantToBuyAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'max_price', 'condition', 'status', 'created_at']
    list_filter = ['status', 'condition', 'created_at']
    search_fields = ['title', 'user__username', 'description']
    list_editable = ['status']
