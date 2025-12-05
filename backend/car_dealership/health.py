from django.http import JsonResponse
from django.views import View
from django.db import connection
from django.core.cache import cache
import sys


class HealthCheckView(View):
    """
    Enhanced health check endpoint for monitoring.
    Returns 200 OK if the application is running and dependencies are accessible.
    Checks: application, database, cache (if configured).
    """
    
    def get(self, request):
        """Return comprehensive health status."""
        health_status = {
            'status': 'healthy',
            'service': 'car-dealership-api',
            'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            'checks': {}
        }
        
        # Check database connectivity
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                health_status['checks']['database'] = 'connected'
        except Exception as e:
            health_status['status'] = 'unhealthy'
            health_status['checks']['database'] = f'error: {str(e)}'
        
        # Check cache (if configured, fails gracefully if using dummy cache)
        try:
            cache.set('health_check', 'ok', 10)
            if cache.get('health_check') == 'ok':
                health_status['checks']['cache'] = 'available'
            else:
                health_status['checks']['cache'] = 'not_configured'
        except Exception as e:
            health_status['checks']['cache'] = 'not_configured'
        
        # Return 503 if unhealthy, 200 if healthy
        status_code = 200 if health_status['status'] == 'healthy' else 503
        
        return JsonResponse(health_status, status=status_code)
