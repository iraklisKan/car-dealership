from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import ContactMessage
from .serializers import ContactMessageSerializer, ContactMessageCreateSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for contact messages.
    
    Allows anyone to create a contact message.
    Only staff can view messages (for admin purposes).
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        """Use create serializer for POST requests."""
        if self.action == 'create':
            return ContactMessageCreateSerializer
        return ContactMessageSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new contact message."""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Save with IP address
        contact_message = serializer.save(ip_address=ip_address)
        
        # You can add email notification logic here
        # send_email_notification(contact_message)
        
        return Response(
            {
                'message': 'Thank you for contacting us! We will get back to you soon.',
                'id': contact_message.id
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read."""
        message = self.get_object()
        message.mark_as_read()
        return Response({'status': 'Message marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_replied(self, request, pk=None):
        """Mark a message as replied."""
        message = self.get_object()
        message.mark_as_replied()
        return Response({'status': 'Message marked as replied'})
