from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from apps.items.views import ItemViewSet
from apps.barter.views import BarterViewSet
from apps.chat.views import MessageViewSet
from apps.users.views import RegisterView, ProfileView, MembershipView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'items', ItemViewSet, basename='item')
router.register(r'barter', BarterViewSet, basename='barter')
router.register(r'chat/messages', MessageViewSet, basename='message')

# Customize admin site
admin.site.site_header = "🛡️ AIT Marketplace Administration"
admin.site.site_title = "AIT Marketplace Admin"
admin.site.index_title = "Welcome to AIT Marketplace Administration"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('manage/', include('apps.admin_panel.urls_web')),
    path('api/', include([
        path('users/register/', RegisterView.as_view(), name='register'),
        path('users/profile/', ProfileView.as_view(), name='profile'),
        path('users/membership/', MembershipView.as_view(), name='membership'),
        path('users/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('orders/', include('apps.orders.urls')),
        path('categories/', include('apps.categories.urls')),
        path('cart/', include('apps.cart.urls')),
        path('wishlist/', include('apps.wishlist.urls')),
        path('search/', include('apps.search.urls')),
        path('addresses/', include('apps.addresses.urls')),
        path('statistics/', include('apps.statistics.urls')),
        path('forum/', include('apps.forum.urls')),
        path('advertisements/', include('apps.advertisements.urls')),
        path('notifications/', include('apps.notifications.urls')),
        path('payments/', include('apps.payments.urls')),
        path('admin-panel/', include('apps.admin_panel.urls')),
        path('wanted/', include('apps.wanted.urls')),
        path('', include(router.urls)),
    ])),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / "static")
