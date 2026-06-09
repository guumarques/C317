from django.urls import path
from .views import ChatSessionListView, ChatSessionCreateView, ChatMessageListView, ChatMessageCreateView

urlpatterns = [
    path('sessions/',                                  ChatSessionListView.as_view()),
    path('sessions/create/',                           ChatSessionCreateView.as_view()),
    path('sessions/<uuid:session_id>/messages/',       ChatMessageCreateView.as_view()),
    path('sessions/<uuid:session_id>/history/',        ChatMessageListView.as_view()),
]