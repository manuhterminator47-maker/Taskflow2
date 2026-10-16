from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from .models import Task
from django.contrib.auth import get_user_model
from django.db.models import Count
# Fixed truncated viewset import
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
# Fixed truncated serializer import
from .serializers import RegisterSerializer, TaskSerializer

User = get_user_model()

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "due_date"]

    def get_queryset(self):
        # Every task query is restricted to the current user
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # The client cannot choose another owner.
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        counts = (
            self.get_queryset()
            .values("status")
            .annotate(total=Count("id"))
            .order_by("status")
        )
        return Response(list(counts))


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
