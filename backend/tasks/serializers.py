from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Task

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    # Fixed the truncated string and missing closing quote/bracket
    owner = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Task
        fields = [
            "id",
            "owner",
            "title",
            "description",
            "status",
            "due_date",
            "created_at",
            "updated_at",
        ]
        # Fixed the truncated list
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 3:
            # Fixed the missing closing quote and parenthesis
            raise serializers.ValidationError("Title must contain at least 3 characters.")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
