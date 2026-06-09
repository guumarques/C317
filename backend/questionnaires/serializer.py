from rest_framework import serializers
from .models import Questionnaires


class QuestionnaireUserSerializer(serializers.Serializer):
    id         = serializers.UUIDField()
    first_name = serializers.CharField()
    last_name  = serializers.CharField()
    role       = serializers.CharField()


class QuestionnaireSerializer(serializers.ModelSerializer):
    user = QuestionnaireUserSerializer(read_only=True)

    class Meta:
        model  = Questionnaires
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