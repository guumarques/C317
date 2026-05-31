from django.urls import path
from .views import DashboardView, DashboardEvolutionView, DashboardChatStatsView

urlpatterns = [
    path('', DashboardView.as_view()),
    path('evolution/', DashboardEvolutionView.as_view()),
    path('chat-stats/', DashboardChatStatsView.as_view()),
]