from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer

class ChatSessionCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session = ChatSession.objects.create(user=request.user)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user).order_by('-started_at')
        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data)

class ChatMessageCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Sessão não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content')
        if not content:
            return Response({'error': 'Conteúdo é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

        # salva mensagem do usuário
        user_message = ChatMessage.objects.create(
            session=session,
            role='user',
            content=content
        )

        # resposta fixa por enquanto (sem LLM)
        assistant_message = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content='Obrigado por compartilhar. Estou aqui para te ouvir e apoiar. Lembre-se que este chat é um espaço de acolhimento e não substitui atendimento profissional.'
        )

        return Response({
            'user_message': ChatMessageSerializer(user_message).data,
            'assistant_message': ChatMessageSerializer(assistant_message).data
        }, status=status.HTTP_201_CREATED)