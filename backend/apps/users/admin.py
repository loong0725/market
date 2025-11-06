from django.contrib import admin
from .models import User, UserMembership
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("AIT Information", {"fields": ("ait_email", "is_verified", "phone", "bio")}),
    )
    list_display = ("username", "email", "ait_email", "is_verified", "is_staff", "is_superuser", "date_joined")
    list_filter = ("is_staff", "is_superuser", "is_verified", "is_active", "date_joined")
    search_fields = ("username", "email", "ait_email")
    ordering = ("-date_joined",)

@admin.register(UserMembership)
class UserMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "start_date", "end_date", "is_active", "price", "is_valid_display")
    list_filter = ("is_active", "start_date", "end_date")
    search_fields = ("user__username", "user__email")
    readonly_fields = ("start_date",)
    
    def is_valid_display(self, obj):
        return obj.is_valid
    is_valid_display.boolean = True
    is_valid_display.short_description = "Valid"
