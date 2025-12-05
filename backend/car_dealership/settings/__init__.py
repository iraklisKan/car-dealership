"""
Django settings initialization.
Loads appropriate settings based on DJANGO_SETTINGS_MODULE environment variable.
Default is development settings.
"""

import os

# Default to development settings
settings_module = os.environ.get('DJANGO_SETTINGS_MODULE', 'car_dealership.settings.development')

if 'development' in settings_module:
    from .development import *
elif 'production' in settings_module:
    from .production import *
else:
    from .development import *
