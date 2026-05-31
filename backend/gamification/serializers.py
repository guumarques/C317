from rest_framework import serializers
from .models import GamificationEvent

class GamificationEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = GamificationEvent
        fields = ['id', 'event_type', 'points', 'occurred_at']
        read_only_fields = ['id', 'occurred_at']