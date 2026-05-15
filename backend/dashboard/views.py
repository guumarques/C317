from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from questionnaires.models import Questionnaires
from users.models import User

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['manager', 'admin']:
            return Response({'error': 'Acesso negado'}, status=403)

        company = request.user.company
        users = User.objects.filter(company=company, role='employee')
        questionnaires = Questionnaires.objects.filter(user__in=users)

        averages = questionnaires.aggregate(
            avg_stress=Avg('stress_score'),
            avg_anxiety=Avg('anxiety_score'),
            avg_burnout=Avg('burnout_score'),
            avg_depression=Avg('depression_score'),
        )

        return Response({
            'total_employees': users.count(),
            'total_questionnaires': questionnaires.count(),
            'averages': averages
        })