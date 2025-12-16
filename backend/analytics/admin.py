from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from .models import PageView, CarView


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ['page_type', 'timestamp', 'ip_address']
    list_filter = ['page_type', 'timestamp']
    search_fields = ['ip_address']
    readonly_fields = ['page_type', 'timestamp', 'ip_address', 'user_agent']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        
        # Add summary statistics
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        stats = {
            'total_views': PageView.objects.count(),
            'today_views': PageView.objects.filter(timestamp__date=today).count(),
            'week_views': PageView.objects.filter(timestamp__date__gte=week_ago).count(),
            'page_breakdown': PageView.objects.values('page_type').annotate(
                count=Count('id')
            ).order_by('-count')
        }
        
        extra_context['stats'] = stats
        return super().changelist_view(request, extra_context=extra_context)


@admin.register(CarView)
class CarViewAdmin(admin.ModelAdmin):
    list_display = ['car_info', 'view_type', 'timestamp', 'ip_address']
    list_filter = ['view_type', 'timestamp']
    search_fields = ['car__brand', 'car__model', 'ip_address']
    readonly_fields = ['car', 'timestamp', 'ip_address', 'user_agent', 'view_type']
    date_hierarchy = 'timestamp'
    
    def car_info(self, obj):
        return f"{obj.car.brand} {obj.car.model} ({obj.car.year})"
    car_info.short_description = 'Car'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        
        # Add summary statistics
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # Most viewed cars
        most_viewed = CarView.objects.values(
            'car__brand', 'car__model', 'car__year', 'car_id'
        ).annotate(
            total_views=Count('id')
        ).order_by('-total_views')[:10]
        
        stats = {
            'total_car_views': CarView.objects.count(),
            'today_car_views': CarView.objects.filter(timestamp__date=today).count(),
            'week_car_views': CarView.objects.filter(timestamp__date__gte=week_ago).count(),
            'most_viewed_cars': most_viewed,
            'view_type_breakdown': CarView.objects.values('view_type').annotate(
                count=Count('id')
            ).order_by('-count')
        }
        
        extra_context['stats'] = stats
        return super().changelist_view(request, extra_context=extra_context)
