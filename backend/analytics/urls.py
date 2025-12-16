from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('track/page/', views.track_page_view, name='track_page'),
    path('track/car/', views.track_car_view, name='track_car'),
]
