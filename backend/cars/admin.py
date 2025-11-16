from django.contrib import admin
from django.utils.html import format_html
from .models import Car, CarImage


class CarImageInline(admin.TabularInline):
    """Inline admin for car images."""
    model = CarImage
    extra = 1
    fields = ['image', 'is_primary', 'caption', 'order', 'image_preview']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 150px;" />', obj.image.url)
        return "No image"
    image_preview.short_description = 'Preview'


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    """Admin interface for Car model."""
    
    inlines = [CarImageInline]
    
    list_display = [
        'full_name',
        'price',
        'year',
        'mileage',
        'transmission',
        'fuel_type',
        'body_type',
        'condition',
        'is_featured',
        'is_available',
        'created_at',
    ]
    
    list_filter = [
        'brand',
        'transmission',
        'fuel_type',
        'body_type',
        'condition',
        'is_featured',
        'is_available',
        'year',
    ]
    
    search_fields = [
        'brand',
        'model',
        'vin',
        'description',
    ]
    
    list_editable = ['is_featured', 'is_available']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('brand', 'model', 'year', 'price', 'condition')
        }),
        ('Specifications', {
            'fields': ('mileage', 'transmission', 'fuel_type', 'body_type', 'engine_size', 
                      'horsepower', 'color', 'doors', 'seats')
        }),
        ('Details', {
            'fields': ('description', 'features', 'vin')
        }),
        ('Status', {
            'fields': ('is_featured', 'is_available')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    """Admin interface for CarImage model."""
    
    list_display = ['car', 'is_primary', 'caption', 'order', 'image_preview', 'uploaded_at']
    list_filter = ['is_primary', 'uploaded_at']
    search_fields = ['car__brand', 'car__model', 'caption']
    list_editable = ['is_primary', 'order']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 150px;" />', obj.image.url)
        return "No image"
    image_preview.short_description = 'Preview'
