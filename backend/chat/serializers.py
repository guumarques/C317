from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'sent_at']
        read_only_fields = ['id', 'sent_at']


class ChatSessionUserSerializer(serializers.Serializer):
    """Dados básicos do dono da sessão — evita expor info sensível."""
    id         = serializers.UUIDField()
    username   = serializers.CharField()
    first_name = serializers.CharField()
    last_name  = serializers.CharField()


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    user     = ChatSessionUserSerializer(read_only=True)

    class Meta:
        model  = ChatSession
        fields = ['id', 'user', 'started_at', 'messages']
        read_only_fields = ['id', 'started_at']