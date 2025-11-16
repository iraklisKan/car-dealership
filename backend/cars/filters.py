from django_filters import rest_framework as filters
from .models import Car


class CarFilter(filters.FilterSet):
    """Filter class for Car model with range filters."""
    
    brand = filters.CharFilter(lookup_expr='icontains')
    model = filters.CharFilter(lookup_expr='icontains')
    year_min = filters.NumberFilter(field_name='year', lookup_expr='gte')
    year_max = filters.NumberFilter(field_name='year', lookup_expr='lte')
    price_min = filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = filters.NumberFilter(field_name='price', lookup_expr='lte')
    mileage_max = filters.NumberFilter(field_name='mileage', lookup_expr='lte')
    
    class Meta:
        model = Car
        fields = {
            'transmission': ['exact'],
            'fuel_type': ['exact'],
            'condition': ['exact'],
            'color': ['icontains'],
            'is_featured': ['exact'],
        }
