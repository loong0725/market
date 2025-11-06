from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.urls import path
from django.template.response import TemplateResponse

class CustomAdminSite(admin.AdminSite):
    site_header = "🛡️ AIT Marketplace Administration"
    site_title = "AIT Marketplace Admin"
    index_title = "Welcome to AIT Marketplace Administration"
    site_url = "/"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('statistics/', self.admin_view(self.admin_statistics_view), name='admin_statistics'),
        ]
        return custom_urls + urls

    def admin_statistics_view(self, request):
        """
        Custom admin view for statistics
        """
        context = {
            **self.each_context(request),
            'title': 'Statistics Dashboard',
            'has_permission': self.has_permission(request, admin),
        }
        return TemplateResponse(request, 'admin/statistics.html', context)

# Create custom admin site instance
custom_admin_site = CustomAdminSite(name='custom_admin')
