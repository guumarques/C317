from rest_framework import serializers
from .models import Questionnaires

class QuestionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questionnaires
        fields = [
            'id',
            'user',
            'stress_score',
            'anxiety_score',
            'burnout_score',
            'depression_score',
            'answered_at',
        ]
        read_only_fields = ['id', 'user', 'answered_at']