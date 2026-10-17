from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, Task
from .serializers import (
    CategorySerializer,
    RegisterSerializer,
    TaskSerializer,
    UserSerializer, 
)

User = get_user_model()


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'category']                 # category added
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date']

    def get_queryset(self):
        # Every task query is restricted to the current user.
        return (
            Task.objects.filter(owner=self.request.user)
            .select_related('owner', 'category')              # avoids N+1
        )

    def perform_create(self, serializer):
        # The client cannot choose another owner.
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        counts = (
            self.get_queryset()
            .values('status')
            .annotate(total=Count('id'))
            .order_by('status')
        )
        return Response(list(counts))


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):         # NEW
    queryset = Category.objects.order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
    # The identity comes from the verified token, never from the URL or body.
        return self.request.user