from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import ContactMessage


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
    
    def test_mark_as_read(self):
        """Test marking message as read."""
        self.message.mark_as_read()
        self.assertEqual(self.message.status, 'read')
    
    def test_mark_as_replied(self):
        """Test marking message as replied."""
        self.message.mark_as_replied()
        self.assertEqual(self.message.status, 'replied')


class ContactMessageAPITest(APITestCase):
    """Test cases for ContactMessage API endpoints."""
    
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
    
    def test_create_contact_message_validation(self):
        """Test validation for contact message creation."""
        data = {
            'name': 'Test',
            'email': 'invalid-email',
            'message': 'Test message',
        }
        response = self.client.post('/api/contact/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
