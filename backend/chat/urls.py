from django.urls import path
from .views import ChatSessionCreateView, ChatMessageCreateView

urlpatterns = [
    path('sessions/', ChatSessionCreateView.as_view()),
    path('sessions/<uuid:session_id>/messages/', ChatMessageCreateView.as_view()),
]