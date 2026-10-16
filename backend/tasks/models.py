from django.db import models

# Create your models here.
from django.conf import settings
from django.db import models



class Category(models.Model):

      name = models.CharField(max_length=100, unique=True)
      color = models.CharField(max_length=7, default="#3498db" )

      def __str__(self):
        return self.name
     



class Task(models.Model):
        class Status(models.TextChoices):
            TODO = "todo", "To do"
            IN_PROGRESS = "in_progress", "In progress"
            DONE = "done", "Done"
        owner = models.ForeignKey(
                settings.AUTH_USER_MODEL,
                on_delete=models.CASCADE,
                related_name="tasks",
                )
        title = models.CharField(max_length=200)
        category = models.ForeignKey(
                                    Category,
                                    on_delete=models.SET_NULL,
                                    null=True,
                                    blank=True,
                                    related_name="tasks",
                                )
        description = models.TextField(blank=True)
        status = models.CharField(
                max_length=20,
                choices=Status.choices,
                default=Status.TODO,
                )
        due_date = models.DateField(null=True, blank=True)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        class Meta:
                ordering = ["-created_at"]

        def __str__(self):
            return self.title

