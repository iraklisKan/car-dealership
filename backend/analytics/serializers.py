from rest_framework import serializers
from .models import PageView, CarView


class PageViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageView
        fields = ['page_type']


class CarViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarView
        fields = ['car', 'view_type']
