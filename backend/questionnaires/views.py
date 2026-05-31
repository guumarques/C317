from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from gamification.models import GamificationEvent
from .models import Questionnaires
from .serializer import QuestionnaireSerializer

class QuestionnaireCreateView(APIView):
    def post(self, request):
        serializer = QuestionnaireSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            
            # Gamificação — 10 pontos por questionário
            request.user.total_points += 10
            request.user.save()
            GamificationEvent.objects.create(
                user=request.user,
                event_type='questionnaire_completed',
                points=10
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class QuestionnaireHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        questionnaires = Questionnaires.objects.filter(user=request.user).order_by('-answered_at')
        serializer = QuestionnaireSerializer(questionnaires, many=True)
        return Response(serializer.data)