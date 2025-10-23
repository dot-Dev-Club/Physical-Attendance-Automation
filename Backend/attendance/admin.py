"""
Django admin configuration for attendance app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Faculty, Student, AttendanceRequest


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin."""
    
    list_display = ['email', 'username', 'name', 'role', 'is_staff', 'is_active']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['email']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    """Faculty admin."""
    
    list_display = ['user', 'title', 'department', 'is_hod', 'created_at']
    list_filter = ['department', 'is_hod']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'title', 'department']
    raw_id_fields = ['user']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """Student admin."""
    
    list_display = ['user', 'student_id', 'department', 'year', 'section', 'mentor']
    list_filter = ['department', 'year', 'section']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'student_id']
    raw_id_fields = ['user', 'mentor']


@admin.register(AttendanceRequest)
class AttendanceRequestAdmin(admin.ModelAdmin):
    """Attendance Request admin."""
    
    list_display = ['id', 'student', 'date', 'status', 'created_at']
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['student__email', 'student__first_name', 'student__last_name', 'purpose']
    raw_id_fields = ['student']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Request Info', {
            'fields': ('student', 'date', 'periods', 'purpose')
        }),
        ('Faculty Details', {
            'fields': ('event_coordinator', 'proof_faculty', 'proof_url')
        }),
        ('Status', {
            'fields': ('status', 'reason')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
