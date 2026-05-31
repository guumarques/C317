from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Insights
from .serializer import InsightSerializer

class InsightListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        insights = Insights.objects.filter(
            questionnaire__user=request.user
        ).order_by('-created_at')
        serializer = InsightSerializer(insights, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = InsightSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class InsightUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'psychologist':
            return Response({'error': 'Acesso negado'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            insight = Insights.objects.get(pk=pk)
        except Insights.DoesNotExist:
            return Response({'error': 'Insight não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = InsightSerializer(insight, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)