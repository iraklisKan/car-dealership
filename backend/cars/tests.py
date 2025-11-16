from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Car


class CarModelTest(TestCase):
    """Test cases for Car model."""
    
    def setUp(self):
        self.car = Car.objects.create(
            brand='Toyota',
            model='Camry',
            year=2022,
            price=25000.00,
            mileage=15000,
            transmission='automatic',
            fuel_type='petrol',
            engine_size=2.5,
            horsepower=203,
            color='Silver',
            doors=4,
            seats=5,
            condition='used',
            description='Well-maintained Toyota Camry',
            features='GPS, Leather Seats, Sunroof',
        )
    
    def test_car_creation(self):
        """Test car is created correctly."""
        self.assertEqual(str(self.car), "2022 Toyota Camry")
        self.assertEqual(self.car.full_name, "2022 Toyota Camry")
    
    def test_features_list(self):
        """Test features_list property."""
        expected_features = ['GPS', 'Leather Seats', 'Sunroof']
        self.assertEqual(self.car.features_list, expected_features)


class CarAPITest(APITestCase):
    """Test cases for Car API endpoints."""
    
    def setUp(self):
        Car.objects.create(
            brand='Honda',
            model='Accord',
            year=2023,
            price=28000.00,
            mileage=5000,
            transmission='automatic',
            fuel_type='hybrid',
            engine_size=2.0,
            horsepower=204,
            color='Blue',
            doors=4,
            seats=5,
            condition='certified',
            description='Certified pre-owned Honda Accord',
        )
    
    def test_get_car_list(self):
        """Test retrieving car list."""
        response = self.client.get('/api/cars/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_car_detail(self):
        """Test retrieving a single car."""
        car = Car.objects.first()
        response = self.client.get(f'/api/cars/{car.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['brand'], 'Honda')
    
    def test_search_cars(self):
        """Test car search endpoint."""
        response = self.client.get('/api/cars/search/?brand=Honda')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
