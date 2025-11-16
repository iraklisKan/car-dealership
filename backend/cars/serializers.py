from rest_framework import serializers
from .models import Car, CarImage


class CarImageSerializer(serializers.ModelSerializer):
    """Serializer for CarImage model."""
    
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary', 'caption', 'order', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class CarSerializer(serializers.ModelSerializer):
    """Serializer for Car model."""
    
    features_list = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    get_image_url = serializers.ReadOnlyField()
    images = CarImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Car
        fields = [
            'id',
            'brand',
            'model',
            'year',
            'price',
            'mileage',
            'transmission',
            'fuel_type',
            'engine_size',
            'horsepower',
            'color',
            'doors',
            'seats',
            'condition',
            'description',
            'images',
            'get_image_url',
            'features',
            'features_list',
            'vin',
            'is_featured',
            'is_available',
            'full_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CarListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for car listings."""
    
    full_name = serializers.ReadOnlyField()
    get_image_url = serializers.ReadOnlyField()
    images = CarImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Car
        fields = [
            'id',
            'brand',
            'model',
            'year',
            'price',
            'mileage',
            'transmission',
            'fuel_type',
            'images',
            'get_image_url',
            'condition',
            'full_name',
            'is_featured',
        ]
