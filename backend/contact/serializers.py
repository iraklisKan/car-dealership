from rest_framework import serializers
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
