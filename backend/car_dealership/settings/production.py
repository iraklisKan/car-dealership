"""
Django production settings for car_dealership project.
All sensitive values must be set in environment variables.
"""

from .base import *
from decouple import config

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# MUST be set in production .env file
ALLOWED_HOSTS = config('ALLOWED_HOSTS').split(',')

# CORS settings for production - MUST be set in .env file
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS').split(',')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'GET',
    'OPTIONS',
    'POST',
]

# Production security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HSTS settings
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Production logging - errors only to file
LOGGING['handlers']['file']['level'] = 'ERROR'
LOGGING['handlers']['console']['level'] = 'WARNING'
