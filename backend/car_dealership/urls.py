"""
URL configuration for car_dealership project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .health import HealthCheckView

# Customize admin site headers
admin.site.site_header = "Car Dealership Administration"
admin.site.site_title = "Car Dealership Admin"
admin.site.index_title = "Welcome to Car Dealership Admin Portal"

urlpatterns = [
    path('secure-admin/', admin.site.urls),  # Changed from 'admin/' for security
    path('api/cars/', include('cars.urls')),
    path('api/contact/', include('contact.urls')),
    path('health/', HealthCheckView.as_view(), name='health-check'),
]

# Serve media files (for development and demo)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Custom error handlers
handler404 = 'django.views.defaults.page_not_found'
handler500 = 'django.views.defaults.server_error'
