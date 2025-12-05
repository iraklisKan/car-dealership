"""
Django development settings for car_dealership project.
All values loaded from environment variables for security.
"""

from .base import *
from decouple import config

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

# Load from environment
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,backend').split(',')

# CORS settings for development - loaded from environment
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000').split(',')

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Development-specific logging
LOGGING['loggers']['django']['level'] = 'DEBUG'
