from django.contrib import admin
from django.utils.html import format_html
from django import forms
from .models import Car, CarImage


class ColorWidget(forms.Select):
    """Custom widget to display color swatches in the admin dropdown."""
    
    COLOR_CODES = {
        'black': '#000000',
        'white': '#FFFFFF',
        'silver': '#C0C0C0',
        'grey': '#808080',
        'blue': '#0000FF',
        'red': '#FF0000',
        'green': '#008000',
        'yellow': '#FFFF00',
        'orange': '#FFA500',
        'brown': '#8B4513',
        'beige': '#F5F5DC',
        'gold': '#FFD700',
        'bronze': '#CD7F32',
        'purple': '#800080',
        'pink': '#FFC0CB',
        'other': '#CCCCCC',
    }
    
    def __init__(self, attrs=None, choices=()):
        super().__init__(attrs, choices)
        if attrs is None:
            attrs = {}
        attrs['style'] = 'padding-left: 35px;'
        self.attrs = attrs
    
    class Media:
        css = {
            'all': ('admin/css/color_widget.css',)
        }
    
    def create_option(self, name, value, label, selected, index, subindex=None, attrs=None):
        option = super().create_option(name, value, label, selected, index, subindex, attrs)
        if value:
            color_code = self.COLOR_CODES.get(value, '#CCCCCC')
            border = '1px solid #000' if value == 'white' else 'none'
            option['attrs']['data-color'] = color_code
            option['attrs']['style'] = f'background: linear-gradient(to right, {color_code} 0%, {color_code} 30px, white 30px);' + (f' border-left: {border};' if value == 'white' else '')
        return option


class CarAdminForm(forms.ModelForm):
    """Custom form for Car admin with color widget."""
    
    class Meta:
        model = Car
        exclude = ['vin']
        widgets = {
            'color': ColorWidget(),
        }


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
    
    form = CarAdminForm
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
        'description',
    ]
    
    list_editable = ['is_featured', 'is_available']
    
    actions = ['delete_selected']  # Enable bulk delete action
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('brand', 'model', 'year', 'price', 'condition')
        }),
        ('Specifications', {
            'fields': ('mileage', 'transmission', 'fuel_type', 'body_type', 'engine_size', 
                      'horsepower', 'color', 'doors', 'seats')
        }),
        ('Details', {
            'fields': ('description', 'features')
        }),
        ('Status', {
            'fields': ('is_featured', 'is_available')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def delete_selected(self, request, queryset):
        """Custom delete action with confirmation."""
        deleted_count = queryset.count()
        queryset.delete()
        self.message_user(request, f'Successfully deleted {deleted_count} car(s).')
    delete_selected.short_description = "Delete selected cars"


@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    """Admin interface for CarImage model."""
    
    list_display = ['car', 'is_primary', 'caption', 'order', 'image_preview', 'uploaded_at']
    list_filter = ['is_primary', 'uploaded_at']
    search_fields = ['car__brand', 'car__model', 'caption']
    list_editable = ['is_primary', 'order']
    
    actions = ['delete_selected']  # Enable bulk delete action
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 150px;" />', obj.image.url)
        return "No image"
    image_preview.short_description = 'Preview'
    
    def delete_selected(self, request, queryset):
        """Custom delete action with confirmation."""
        deleted_count = queryset.count()
        queryset.delete()
        self.message_user(request, f'Successfully deleted {deleted_count} image(s).')
    delete_selected.short_description = "Delete selected images"
