from django.db import models
from django.core.validators import EmailValidator


class ContactMessage(models.Model):
    """Model for storing contact form submissions."""
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('archived', 'Archived'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField(validators=[EmailValidator()])
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=200, blank=True, default='General Inquiry')
    message = models.TextField()
    
    # Optional: link to a specific car
    car = models.ForeignKey(
        'cars.Car',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inquiries'
    )
    
    # Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
        indexes = [
            models.Index(fields=['-created_at'], name='contact_created_idx'),
            models.Index(fields=['status'], name='contact_status_idx'),
            models.Index(fields=['email'], name='contact_email_idx'),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.subject} ({self.created_at.strftime('%Y-%m-%d')})"
    
    def mark_as_read(self):
        """Mark message as read."""
        if self.status == 'new':
            self.status = 'read'
            self.save()
    
    def mark_as_replied(self):
        """Mark message as replied."""
        self.status = 'replied'
        self.save()
