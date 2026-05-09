from rest_framework import serializers
from .models import Insights

class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insights
        fields = ['id', 'questionnaire', 'created_by', 'content', 'status', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']