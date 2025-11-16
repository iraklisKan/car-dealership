from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


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
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField(
        validators=[
            MinValueValidator(1900),
            MaxValueValidator(2030)
        ]
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Specifications
    mileage = models.IntegerField(help_text="Mileage in kilometers")
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES)
    body_type = models.CharField(max_length=20, choices=BODY_TYPE_CHOICES, blank=True, null=True, help_text="Body type/style of the vehicle")
    engine_size = models.DecimalField(max_digits=3, decimal_places=1, help_text="Engine size in liters")
    horsepower = models.IntegerField()
    color = models.CharField(max_length=50)
    doors = models.IntegerField(validators=[MinValueValidator(2), MaxValueValidator(5)])
    seats = models.IntegerField(validators=[MinValueValidator(2), MaxValueValidator(9)])
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='used')
    
    # Description and Images
    description = models.TextField()
    
    # Features (stored as comma-separated values)
    features = models.TextField(
        blank=True,
        help_text="Comma-separated list of features (e.g., 'GPS, Leather Seats, Sunroof')"
    )
    
    # Metadata
    vin = models.CharField(max_length=17, unique=True, blank=True, null=True, help_text="Vehicle Identification Number")
    is_featured = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Car'
        verbose_name_plural = 'Cars'
    
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
        # Ensure only one primary image per car
        if self.is_primary:
            CarImage.objects.filter(car=self.car, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)
