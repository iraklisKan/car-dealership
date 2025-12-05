from rest_framework import serializers
from django.core.validators import EmailValidator, RegexValidator
from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    """Serializer for ContactMessage model."""
    
    car_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ContactMessage
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'subject',
            'message',
            'car',
            'car_details',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']
    
    def validate_name(self, value):
        """Validate name field."""
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        if len(value) > 100:
            raise serializers.ValidationError("Name must be less than 100 characters.")
        return value.strip()
    
    def validate_email(self, value):
        """Validate email field."""
        if not value or not value.strip():
            raise serializers.ValidationError("Email cannot be empty.")
        validator = EmailValidator(message="Enter a valid email address.")
        validator(value)
        return value.strip().lower()
    
    def validate_phone(self, value):
        """Validate phone field."""
        if value:
            # Remove spaces and common separators
            cleaned = value.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if not cleaned.isdigit() and not cleaned.startswith('+'):
                raise serializers.ValidationError("Phone number must contain only digits, spaces, and + for country code.")
            if len(cleaned) < 8:
                raise serializers.ValidationError("Phone number must be at least 8 digits.")
        return value
    
    def validate_message(self, value):
        """Validate message field."""
        if not value or not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        if len(value) > 2000:
            raise serializers.ValidationError("Message must be less than 2000 characters.")
        return value.strip()
    
    def get_car_details(self, obj):
        """Get basic car details if linked to a car."""
        if obj.car:
            return {
                'id': obj.car.id,
                'name': obj.car.full_name,
                'price': str(obj.car.price),
            }
        return None
    
    def create(self, validated_data):
        """Create contact message and get IP from request."""
        request = self.context.get('request')
        if request:
            # Get IP address from request
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            validated_data['ip_address'] = ip_address
        
        return super().create(validated_data)


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating contact messages."""
    
    class Meta:
        model = ContactMessage
        fields = [
            'name',
            'email',
            'phone',
            'subject',
            'message',
            'car',
        ]
