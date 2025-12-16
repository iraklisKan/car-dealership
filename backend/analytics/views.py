from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PageView, CarView
from .serializers import PageViewSerializer, CarViewSerializer


def get_client_ip(request):
    """Extract client IP from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(['POST'])
def track_page_view(request):
    """Track a page view"""
    serializer = PageViewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        return Response({'status': 'recorded'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def track_car_view(request):
    """Track a car view"""
    serializer = CarViewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        return Response({'status': 'recorded'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
