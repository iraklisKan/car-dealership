from django.test import TestCase, override_settings
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.exceptions import ValidationError
from .models import ContactMessage
from cars.models import Car


class ContactMessageModelTest(TestCase):
    """Test cases for ContactMessage model."""
    
    def setUp(self):
        self.message = ContactMessage.objects.create(
            name='John Doe',
            email='john@example.com',
            phone='1234567890',
            subject='Inquiry about Toyota Camry',
            message='I am interested in the 2022 Toyota Camry.',
        )
    
    def test_message_creation(self):
        """Test contact message is created correctly."""
        self.assertEqual(self.message.name, 'John Doe')
        self.assertEqual(self.message.status, 'new')
        self.assertIsNotNone(self.message.created_at)
    
    def test_message_str_representation(self):
        """Test string representation of message."""
        expected = f"{self.message.name} - {self.message.subject}"
        self.assertIn(expected, str(self.message))
    
    def test_mark_as_read(self):
        """Test marking message as read."""
        self.message.mark_as_read()
        self.assertEqual(self.message.status, 'read')
    
    def test_mark_as_read_only_from_new(self):
        """Test marking as read only works from new status."""
        self.message.status = 'replied'
        self.message.save()
        self.message.mark_as_read()
        self.assertEqual(self.message.status, 'replied')  # Should not change
    
    def test_mark_as_replied(self):
        """Test marking message as replied."""
        self.message.mark_as_replied()
        self.assertEqual(self.message.status, 'replied')
    
    def test_message_without_phone(self):
        """Test creating message without phone number."""
        msg = ContactMessage.objects.create(
            name='Jane Smith',
            email='jane@example.com',
            message='General inquiry',
        )
        self.assertIsNone(msg.phone)
    
    def test_message_linked_to_car(self):
        """Test creating message linked to specific car."""
        car = Car.objects.create(
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
        )
        msg = ContactMessage.objects.create(
            name='Test User',
            email='test@example.com',
            message='Interested in this car',
            car=car
        )
        self.assertEqual(msg.car, car)
        self.assertIn(msg, car.inquiries.all())


@override_settings(
    REST_FRAMEWORK={
        'DEFAULT_THROTTLE_RATES': {
            'anon': '10000/day',
            'user': '10000/day'
        }
    }
)
class ContactMessageAPITest(APITestCase):
    """Test cases for ContactMessage API endpoints."""
    
    def setUp(self):
        # Clear throttle cache before each test
        from django.core.cache import cache
        cache.clear()
    
    def test_create_contact_message(self):
        """Test creating a contact message via API."""
        data = {
            'name': 'Jane Smith',
            'email': 'jane@example.com',
            'subject': 'General Inquiry',
            'message': 'What are your opening hours?',
        }
        response = self.client.post('/api/contact/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
    
    def test_create_contact_message_with_phone(self):
        """Test creating message with phone number."""
        data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'phone': '+357 99123456',
            'subject': 'Car inquiry',
            'message': 'I want to schedule a test drive.',
        }
        response = self.client.post('/api/contact/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_contact_message_validation(self):
        """Test validation for contact message creation."""
        data = {
            'name': 'Test',
            'email': 'invalid-email',
            'message': 'Test message',
        }
        response = self.client.post('/api/contact/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_contact_message_missing_fields(self):
        """Test creating message with missing required fields."""
        data = {
            'name': 'Test User',
            # Missing email and message
        }
        response = self.client.post('/api/contact/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_contact_message_empty_message(self):
        """Test creating message with empty message field."""
        data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'message': '',
        }
        response = self.client.post('/api/contact/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
