from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Insights
from .serializer import InsightSerializer

from users.permissions import HasAcceptedLGPD, IsPsychologist, IsEmployeeOrPsychologist

class InsightCreateView(APIView):
    permission_classes = [IsAuthenticated, HasAcceptedLGPD, IsPsychologist]

    def post(self, request):
        serializer = InsightSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InsightHistoryView(APIView):
    permission_classes = [IsAuthenticated, HasAcceptedLGPD, IsEmployeeOrPsychologist]

    def get(self, request):
        insights = Insights.objects.filter(
            questionnaire__user=request.user
        ).order_by('-created_at')
        serializer = InsightSerializer(insights, many=True)
        return Response(serializer.data)