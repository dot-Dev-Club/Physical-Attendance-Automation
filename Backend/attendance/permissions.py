"""
Custom permissions for attendance system role-based access control.
"""
from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Allow only users with Student role."""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'Student'
        )


class IsFaculty(permissions.BasePermission):
    """Allow only users with Faculty role."""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'Faculty'
        )


class IsHOD(permissions.BasePermission):
    """Allow only Faculty users with is_hod=True."""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'Faculty' and
            hasattr(request.user, 'faculty_profile') and
            request.user.faculty_profile.is_hod
        )


class IsStudentOwner(permissions.BasePermission):
    """Allow students to access only their own requests."""
    
    def has_object_permission(self, request, view, obj):
        return obj.student == request.user
