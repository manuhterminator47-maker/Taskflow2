from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase,APIClient
from .models import Task
from rest_framework.response import Response
User = get_user_model()


class TaskAPITests(APITestCase):

    client: APIClient # Type hint for the IDE at class level

    def setUp(self):
        self.user = User.objects.create_user(
            username="amina",
            password="Test-password-123",
        )
        self.other = User.objects.create_user(
            username="brian",
            password="Test-password-456",
        )
        self.client.force_authenticate(user=self.user)

    def test_create_task(self):
        response = self.client.post(
            "/api/tasks/", {"title": "Study Django"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED) # type: ignore
        self.assertEqual(Task.objects.get().owner, self.user)

    def test_title_too_short(self):
        response = self.client.post(
            "/api/tasks/", {"title": "x"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) # type: ignore

    def test_user_cannot_see_other_users_task(self):
        task = Task.objects.create(owner=self.other, title="Brian's Task")
        response = self.client.get(f"/api/tasks/{task.pk}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)  # type: ignore # Or HTTP_403_FORBIDDEN depending on your permission setup

    def test_requires_login(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) # type: ignore
