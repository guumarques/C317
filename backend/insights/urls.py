from django.urls import path
from .views import InsightListView, InsightUpdateView

urlpatterns = [
    path('', InsightListView.as_view()),
    path('<uuid:pk>/', InsightUpdateView.as_view()),
]