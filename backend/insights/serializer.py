from rest_framework import serializers
from .models import Insights


class InsightSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model  = Insights
        fields = ['id', 'questionnaire', 'created_by', 'content', 'status', 'created_at', 'user']
        read_only_fields = ['id', 'created_by', 'created_at', 'user']

    def get_user(self, obj):
        try:
            u = obj.questionnaire.user
            return f"{u.first_name} {u.last_name}".strip() or u.username
        except AttributeError:
            return None