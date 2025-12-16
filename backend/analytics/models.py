from django.db import models
from cars.models import Car


class PageView(models.Model):
    """Track page views across the website"""
    PAGE_CHOICES = [
        ('home', 'Home Page'),
        ('car_list', 'Car Listing'),
        ('car_detail', 'Car Detail'),
        ('contact', 'Contact Page'),
    ]
    
    page_type = models.CharField(max_length=20, choices=PAGE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Page View'
        verbose_name_plural = 'Page Views'
    
    def __str__(self):
        return f"{self.get_page_type_display()} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class CarView(models.Model):
    """Track views of specific cars"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='analytics_views')
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    view_type = models.CharField(
        max_length=20,
        choices=[
            ('card_click', 'Card Click'),
            ('detail_view', 'Detail View'),
        ],
        default='detail_view'
    )
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Car View'
        verbose_name_plural = 'Car Views'
    
    def __str__(self):
        return f"{self.car.brand} {self.car.model} - {self.view_type} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
