from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer, ContactMessageCreateSerializer
import logging

logger = logging.getLogger(__name__)


class ContactFormThrottle(AnonRateThrottle):
    """Custom throttle for contact form submissions."""
    rate = '5/hour'


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for contact messages.
    
    Allows anyone to create a contact message.
    Only staff can view messages (for admin purposes).
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ContactFormThrottle]
    
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
        
        # Send email notification
        try:
            self._send_notification_email(contact_message)
        except Exception as e:
            logger.error(f"Failed to send email notification: {str(e)}")
            # Don't fail the request if email fails
        
        return Response(
            {
                'message': 'Thank you for contacting us! We will get back to you soon.',
                'id': contact_message.id
            },
            status=status.HTTP_201_CREATED
        )
    
    def _send_notification_email(self, contact_message):
        """Send email notification to admin and confirmation to customer."""
        # Email to admin
        admin_subject = f'New Contact Form Submission - {contact_message.subject or "No Subject"}'
        admin_message = f"""
New contact form submission:

Name: {contact_message.name}
Email: {contact_message.email}
Phone: {contact_message.phone or 'Not provided'}
Subject: {contact_message.subject or 'Not provided'}

Message:
{contact_message.message}

Car of Interest: {contact_message.car.full_name if contact_message.car else 'None'}
Submitted at: {contact_message.created_at}
IP Address: {contact_message.ip_address}
"""
        
        send_mail(
            subject=admin_subject,
            message=admin_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        
        # Confirmation email to customer
        customer_subject = 'Thank you for contacting Car Dealership'
        customer_message = f"""
Dear {contact_message.name},

Thank you for contacting us! We have received your message and will get back to you as soon as possible.

Your message:
{contact_message.message}

Best regards,
Car Dealership Team
Phone: 99 022802
Email: autodealercy@gmail.com
"""
        
        send_mail(
            subject=customer_subject,
            message=customer_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[contact_message.email],
            fail_silently=False,
        )
        
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
