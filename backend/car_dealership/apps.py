from django.apps import AppConfig


class CarDealershipConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'car_dealership'
    
    def ready(self):
        # Import admin customizations
        import car_dealership.admin
