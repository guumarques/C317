from django.urls import path
from .views import ChatSessionCreateView, ChatSessionHistoryView, ChatMessageCreateView

urlpatterns = [
    path('sessions/', ChatSessionCreateView.as_view()),
    path('sessions/history/', ChatSessionHistoryView.as_view()),
    path('sessions/<uuid:session_id>/messages/', ChatMessageCreateView.as_view()),
]