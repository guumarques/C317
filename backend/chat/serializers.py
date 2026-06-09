from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ChatMessage
        fields = ['id', 'role', 'content', 'sent_at']
        read_only_fields = ['id', 'sent_at']


class ChatParticipantSerializer(serializers.Serializer):
    id         = serializers.UUIDField()
    first_name = serializers.CharField()
    last_name  = serializers.CharField()


class ChatSessionSerializer(serializers.ModelSerializer):
    psychologist = ChatParticipantSerializer(read_only=True)
    employee     = ChatParticipantSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model  = ChatSession
        fields = ['id', 'psychologist', 'employee', 'started_at', 'last_message']
        read_only_fields = ['id', 'started_at']

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-sent_at').first()
        if not msg:
            return None
        return {'content': msg.content[:60], 'sent_at': msg.sent_at}