from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Car
from .serializers import CarSerializer, CarListSerializer
from .filters import CarFilter


class CarViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing cars.
    
    Provides list and detail views with filtering, searching, and ordering.
    """
    queryset = Car.objects.filter(is_available=True)
    serializer_class = CarSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CarFilter
    search_fields = ['brand', 'model', 'description', 'color']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return CarListSerializer
        return CarSerializer
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the 10 latest cars for the homepage."""
        latest_cars = self.queryset.order_by('-created_at')[:10]
        serializer = CarListSerializer(latest_cars, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured cars."""
        featured_cars = self.queryset.filter(is_featured=True)
        serializer = CarListSerializer(featured_cars, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Advanced search endpoint with multiple filters.
        Query params: brand, model, year_min, year_max, price_min, price_max,
                     transmission, mileage_max, fuel_type, condition
        """
        queryset = self.queryset
        
        # Apply filters from query params
        brand = request.query_params.get('brand', None)
        model = request.query_params.get('model', None)
        year_min = request.query_params.get('year_min', None)
        year_max = request.query_params.get('year_max', None)
        price_min = request.query_params.get('price_min', None)
        price_max = request.query_params.get('price_max', None)
        transmission = request.query_params.get('transmission', None)
        mileage_max = request.query_params.get('mileage_max', None)
        fuel_type = request.query_params.get('fuel_type', None)
        condition = request.query_params.get('condition', None)
        
        if brand:
            queryset = queryset.filter(brand__icontains=brand)
        if model:
            queryset = queryset.filter(model__icontains=model)
        if year_min:
            queryset = queryset.filter(year__gte=year_min)
        if year_max:
            queryset = queryset.filter(year__lte=year_max)
        if price_min:
            queryset = queryset.filter(price__gte=price_min)
        if price_max:
            queryset = queryset.filter(price__lte=price_max)
        if transmission:
            queryset = queryset.filter(transmission=transmission)
        if mileage_max:
            queryset = queryset.filter(mileage__lte=mileage_max)
        if fuel_type:
            queryset = queryset.filter(fuel_type=fuel_type)
        if condition:
            queryset = queryset.filter(condition=condition)
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CarListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = CarListSerializer(queryset, many=True)
        return Response(serializer.data)
