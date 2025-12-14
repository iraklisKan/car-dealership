from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.exceptions import ValidationError
from decimal import Decimal
from .models import Car, CarImage


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
        self.assertTrue(self.car.is_available)
        self.assertFalse(self.car.is_featured)
    
    def test_car_without_description(self):
        """Test car can be created without description."""
        car = Car.objects.create(
            brand='Honda',
            model='Civic',
            year=2023,
            price=22000.00,
            mileage=10000,
            transmission='manual',
            fuel_type='petrol',
            engine_size=2.0,
            horsepower=180,
            color='Red',
            doors=4,
            seats=5,
            condition='used',
        )
        self.assertEqual(car.description, '')
    
    def test_features_list(self):
        """Test features_list property."""
        expected_features = ['GPS', 'Leather Seats', 'Sunroof']
        self.assertEqual(self.car.features_list, expected_features)
    
    def test_features_list_empty(self):
        """Test features_list when features is empty."""
        self.car.features = ''
        self.assertEqual(self.car.features_list, [])
    
    def test_price_validation(self):
        """Test that negative price is rejected."""
        car = Car(
            brand='BMW',
            model='X5',
            year=2023,
            price=-1000.00,
            mileage=10000,
            transmission='automatic',
            fuel_type='diesel',
            engine_size=3.0,
            horsepower=265,
            color='Black',
            doors=4,
            seats=5,
            condition='used',
        )
        with self.assertRaises(ValidationError):
            car.full_clean()
    
    def test_year_validation(self):
        """Test year must be within valid range."""
        car = Car(
            brand='Tesla',
            model='Model 3',
            year=1899,  # Too old
            price=35000.00,
            mileage=5000,
            transmission='automatic',
            fuel_type='electric',
            engine_size=0.0,
            horsepower=283,
            color='White',
            doors=4,
            seats=5,
            condition='new',
        )
        with self.assertRaises(ValidationError):
            car.full_clean()
    
    def test_mileage_validation(self):
        """Test mileage must be non-negative."""
        car = Car(
            brand='Ford',
            model='Mustang',
            year=2022,
            price=45000.00,
            mileage=-100,  # Negative mileage
            transmission='manual',
            fuel_type='petrol',
            engine_size=5.0,
            horsepower=450,
            color='Red',
            doors=2,
            seats=4,
            condition='used',
        )
        with self.assertRaises(ValidationError):
            car.full_clean()
    
    def test_vin_validation(self):
        """Test VIN must be 17 characters."""
        car = Car(
            brand='Mercedes',
            model='C-Class',
            year=2023,
            price=42000.00,
            mileage=8000,
            transmission='automatic',
            fuel_type='diesel',
            engine_size=2.0,
            horsepower=204,
            color='Silver',
            doors=4,
            seats=5,
            condition='certified',
            vin='INVALID'  # Too short
        )
        with self.assertRaises(ValidationError):
            car.full_clean()
    
    def test_get_image_url_no_images(self):
        """Test get_image_url returns None when no images exist."""
        self.assertIsNone(self.car.get_image_url)


class CarAPITest(APITestCase):
    """Test cases for Car API endpoints."""
    
    def setUp(self):
        self.car1 = Car.objects.create(
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
        self.car2 = Car.objects.create(
            brand='Toyota',
            model='Corolla',
            year=2022,
            price=18000.00,
            mileage=25000,
            transmission='automatic',
            fuel_type='petrol',
            engine_size=1.8,
            horsepower=139,
            color='White',
            doors=4,
            seats=5,
            condition='used',
        )
    
    def test_get_car_list(self):
        """Test retrieving car list."""
        response = self.client.get('/api/cars/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_get_car_detail(self):
        """Test retrieving a single car."""
        response = self.client.get(f'/api/cars/{self.car1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['brand'], 'Honda')
        self.assertEqual(response.data['model'], 'Accord')
    
    def test_get_car_detail_not_found(self):
        """Test retrieving non-existent car returns 404."""
        response = self.client.get('/api/cars/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_filter_by_brand(self):
        """Test filtering cars by brand."""
        response = self.client.get('/api/cars/?brand=Honda')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['brand'], 'Honda')
    
    def test_filter_by_price_range(self):
        """Test filtering cars by price range."""
        response = self.client.get('/api/cars/?price_min=15000&price_max=20000')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
        # Verify all results are within price range
        for car in response.data['results']:
            price = float(car['price'])
            self.assertGreaterEqual(price, 15000)
            self.assertLessEqual(price, 20000)
    
    def test_filter_by_year(self):
        """Test filtering cars by year."""
        response = self.client.get('/api/cars/?year_min=2023&year_max=2023')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
        # Should only return cars from 2023
        for car in response.data['results']:
            self.assertEqual(car['year'], 2023)
    
    def test_filter_by_transmission(self):
        """Test filtering cars by transmission type."""
        response = self.client.get('/api/cars/?transmission=automatic')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_filter_by_fuel_type(self):
        """Test filtering cars by fuel type."""
        response = self.client.get('/api/cars/?fuel_type=hybrid')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['fuel_type'], 'hybrid')
    
    def test_ordering_by_price_asc(self):
        """Test ordering cars by price ascending."""
        response = self.client.get('/api/cars/?ordering=price')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(results[0]['price'], '18000.00')
        self.assertEqual(results[1]['price'], '28000.00')
    
    def test_ordering_by_price_desc(self):
        """Test ordering cars by price descending."""
        response = self.client.get('/api/cars/?ordering=-price')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(results[0]['price'], '28000.00')
        self.assertEqual(results[1]['price'], '18000.00')
    
    def test_search_cars(self):
        """Test car search endpoint."""
        response = self.client.get('/api/cars/search/?brand=Honda')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_latest_cars_endpoint(self):
        """Test getting latest cars."""
        response = self.client.get('/api/cars/latest/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
