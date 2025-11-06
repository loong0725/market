from django.contrib import admin
from .models import Category, CategoryParameter

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_active', 'sort_order', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['sort_order', 'name']
    list_editable = ['is_active', 'sort_order']

@admin.register(CategoryParameter)
class CategoryParameterAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'parameter_type', 'is_required', 'sort_order']
    list_filter = ['parameter_type', 'is_required', 'category']
    search_fields = ['name', 'category__name']
    ordering = ['category', 'sort_order', 'name']
    list_editable = ['is_required', 'sort_order']
