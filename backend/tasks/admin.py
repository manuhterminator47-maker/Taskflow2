from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Task
from .models import Category
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "status", "due_date")
    list_filter = ("status",)
    search_fields = ("title", "description")


admin.site.register(Category)
