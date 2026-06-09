from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
from users.models import User


class ChatSessionListView(APIView):
    """Lista as sessões do usuário logado."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'psychologist':
            # Psicólogo vê todos os seus chats (um por funcionário)
            sessions = ChatSession.objects.filter(
                psychologist=request.user
            ).annotate(msg_count=Count('messages')).order_by('-started_at').select_related('employee')
        else:
            # Funcionário vê todos os seus chats (um por psicólogo)
            sessions = ChatSession.objects.filter(
                employee=request.user
            ).annotate(msg_count=Count('messages')).order_by('-started_at').select_related('psychologist')

        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class ChatSessionCreateView(APIView):
    """Psicólogo cria ou recupera um chat com um funcionário."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role == 'psychologist':
            employee_id = request.data.get('employee_id')
            try:
                employee = User.objects.get(id=employee_id, company=request.user.company, role='employee')
            except User.DoesNotExist:
                return Response({'error': 'Funcionário não encontrado.'}, status=404)
            session, _ = ChatSession.objects.get_or_create(psychologist=request.user, employee=employee)
        else:
            psychologist_id = request.data.get('psychologist_id')
            try:
                psychologist = User.objects.get(id=psychologist_id, company=request.user.company, role='psychologist')
            except User.DoesNotExist:
                return Response({'error': 'Psicólogo não encontrado.'}, status=404)
            session, _ = ChatSession.objects.get_or_create(psychologist=psychologist, employee=request.user)

        return Response(ChatSessionSerializer(session).data, status=status.HTTP_200_OK)


class ChatMessageListView(APIView):
    """Lista mensagens de uma sessão."""
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            if request.user.role == 'psychologist':
                session = ChatSession.objects.get(id=session_id, psychologist=request.user)
            else:
                session = ChatSession.objects.get(id=session_id, employee=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Sessão não encontrada.'}, status=404)

        messages = ChatMessage.objects.filter(session=session).order_by('sent_at')
        return Response(ChatMessageSerializer(messages, many=True).data)


class ChatMessageCreateView(APIView):
    """Envia uma mensagem em uma sessão."""
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            if request.user.role == 'psychologist':
                session = ChatSession.objects.get(id=session_id, psychologist=request.user)
            else:
                session = ChatSession.objects.get(id=session_id, employee=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Sessão não encontrada.'}, status=404)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Conteúdo é obrigatório.'}, status=400)

        role = 'psychologist' if request.user.role == 'psychologist' else 'employee'
        message = ChatMessage.objects.create(
            session=session,
            sender=request.user,
            role=role,
            content=content,
        )
        return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)