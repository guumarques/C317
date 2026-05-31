from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import GamificationEvent
from .serializer import GamificationEventSerializer

class GamificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        events = GamificationEvent.objects.filter(user=request.user).order_by('-occurred_at')
        return Response({
            'total_points': request.user.total_points,
            'login_streak': request.user.login_streak,
            'events': GamificationEventSerializer(events, many=True).data
        })