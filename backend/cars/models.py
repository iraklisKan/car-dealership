from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys
import re


def validate_brand_model(value):
    """Validate that brand/model contains only allowed characters."""
    if not re.match(r'^[a-zA-Z0-9\s\-\.]+$', value):
        raise ValidationError('Only letters, numbers, spaces, hyphens, and periods are allowed.')
    if len(value.strip()) < 2:
        raise ValidationError('Must be at least 2 characters long.')


def validate_color(value):
    """Validate color field."""
    if not re.match(r'^[a-zA-Z\s\-]+$', value):
        raise ValidationError('Color should only contain letters, spaces, and hyphens.')


def validate_vin(value):
    """Validate VIN format (17 alphanumeric characters, no I, O, Q)."""
    if value and len(value) > 0:
        if len(value) != 17:
            raise ValidationError('VIN must be exactly 17 characters.')
        if not re.match(r'^[A-HJ-NPR-Z0-9]{17}$', value.upper()):
            raise ValidationError('VIN must contain only letters (excluding I, O, Q) and numbers.')


class Car(models.Model):
    """Model representing a car in the dealership inventory."""
    
    TRANSMISSION_CHOICES = [
        ('automatic', 'Automatic'),
        ('manual', 'Manual'),
        ('semi-automatic', 'Semi-Automatic'),
    ]
    
    FUEL_TYPE_CHOICES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
    ]
    
    BODY_TYPE_CHOICES = [
        ('sedan', 'Sedan'),
        ('suv', 'SUV'),
        ('truck', 'Truck'),
        ('van', 'Van'),
        ('coupe', 'Coupe'),
        ('hatchback', 'Hatchback'),
        ('wagon', 'Wagon'),
        ('convertible', 'Convertible'),
        ('pickup', 'Pickup'),
        ('minivan', 'Minivan'),
    ]
    
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('used', 'Used'),
        ('certified', 'Certified Pre-Owned'),
    ]
    
    # Basic Information
    brand = models.CharField(max_length=100, validators=[validate_brand_model])
    model = models.CharField(max_length=100, validators=[validate_brand_model])
    year = models.IntegerField(
        validators=[
            MinValueValidator(1900),
            MaxValueValidator(2030)
        ]
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Specifications
    mileage = models.IntegerField(
        help_text="Mileage in kilometers",
        validators=[MinValueValidator(0), MaxValueValidator(1000000)]
    )
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES)
    body_type = models.CharField(max_length=20, choices=BODY_TYPE_CHOICES, blank=True, null=True, help_text="Body type/style of the vehicle")
    engine_size = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        help_text="Engine size in liters",
        validators=[MinValueValidator(0.1), MaxValueValidator(15.0)]
    )
    horsepower = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(2000)]
    )
    color = models.CharField(max_length=50, validators=[validate_color])
    doors = models.IntegerField(validators=[MinValueValidator(2), MaxValueValidator(5)])
    seats = models.IntegerField(validators=[MinValueValidator(2), MaxValueValidator(9)])
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='used')
    
    # Description and Images
    description = models.TextField(max_length=5000)
    
    # Features (stored as comma-separated values)
    features = models.TextField(
        blank=True,
        max_length=2000,
        help_text="Comma-separated list of features (e.g., 'GPS, Leather Seats, Sunroof')"
    )
    
    # Metadata
    vin = models.CharField(
        max_length=17, 
        unique=True, 
        blank=True, 
        null=True, 
        validators=[validate_vin],
        help_text="Vehicle Identification Number"
    )
    is_featured = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Car'
        verbose_name_plural = 'Cars'
        indexes = [
            models.Index(fields=['brand', 'model'], name='brand_model_idx'),
            models.Index(fields=['price'], name='price_idx'),
            models.Index(fields=['year'], name='year_idx'),
            models.Index(fields=['-created_at'], name='created_at_idx'),
            models.Index(fields=['is_available', 'is_featured'], name='availability_idx'),
            models.Index(fields=['fuel_type'], name='fuel_type_idx'),
            models.Index(fields=['transmission'], name='transmission_idx'),
            models.Index(fields=['body_type'], name='body_type_idx'),
        ]
    
    def __str__(self):
        return f"{self.year} {self.brand} {self.model}"
    
    @property
    def features_list(self):
        """Return features as a list."""
        if self.features:
            return [f.strip() for f in self.features.split(',')]
        return []
    
    @property
    def full_name(self):
        """Return full car name."""
        return f"{self.year} {self.brand} {self.model}"
    
    @property
    def get_image_url(self):
        """Return primary image URL."""
        primary_image = self.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url
        first_image = self.images.first()
        if first_image:
            return first_image.image.url
        return None


class CarImage(models.Model):
    """Model for storing multiple images for a car."""
    
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='cars/', help_text="Upload car image")
    is_primary = models.BooleanField(default=False, help_text="Set as primary/cover image")
    caption = models.CharField(max_length=200, blank=True, help_text="Optional image caption")
    order = models.PositiveIntegerField(default=0, help_text="Display order")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'order', 'uploaded_at']
        verbose_name = 'Car Image'
        verbose_name_plural = 'Car Images'
    
    def __str__(self):
        return f"Image for {self.car.full_name} - {'Primary' if self.is_primary else 'Additional'}"
    
    def save(self, *args, **kwargs):
        """Save with image optimization."""
        # Ensure only one primary image per car
        if self.is_primary:
            CarImage.objects.filter(car=self.car, is_primary=True).update(is_primary=False)
        
        # Optimize image before saving
        if self.image:
            img = Image.open(self.image)
            
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Resize if image is too large (max 1920x1080)
            max_size = (1920, 1080)
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            output = BytesIO()
            img.save(output, format='JPEG', quality=85, optimize=True)
            output.seek(0)
            
            # Replace the image file with optimized version
            self.image = InMemoryUploadedFile(
                output, 'ImageField',
                f"{self.image.name.split('.')[0]}.jpg",
                'image/jpeg',
                sys.getsizeof(output), None
            )
        
        super().save(*args, **kwargs)
