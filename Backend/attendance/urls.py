"""
URL configuration for attendance app.

Maps to endpoints specified in BACKEND_INTEGRATION.md
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router for viewsets
router = DefaultRouter()
router.register(r'attendance/requests', views.AttendanceRequestViewSet, basename='attendance-request')

urlpatterns = [
    # Authentication endpoints
    path('auth/login', views.login_view, name='login'),
    path('auth/logout', views.logout_view, name='logout'),
    path('auth/me', views.me_view, name='me'),
    path('auth/refresh', views.refresh_token_view, name='refresh-token'),
    
    # Faculty endpoints
    path('faculty', views.FacultyListView.as_view(), name='faculty-list'),
    path('faculty/by-department/<str:department>', views.FacultyByDepartmentView.as_view(), name='faculty-by-department'),
    
    # Statistics endpoint
    path('attendance/statistics', views.statistics_view, name='attendance-statistics'),
    
    # Router URLs (attendance requests CRUD)
    path('', include(router.urls)),
]
