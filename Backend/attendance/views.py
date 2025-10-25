"""
Views for Physical Attendance Automation API.

Implements all endpoints specified in BACKEND_INTEGRATION.md
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Count
from datetime import datetime

from .models import User, Faculty, Student, AttendanceRequest
from .serializers import (
    UserSerializer, LoginSerializer, FacultySerializer,
    AttendanceRequestSerializer, AttendanceRequestCreateSerializer,
    AttendanceRequestStatusUpdateSerializer
)
from .permissions import IsStudent, IsFaculty, IsHOD, IsStudentOwner


# ============================================================================
# Authentication Views
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login
    Login user and return JWT token with role information.
    """
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    # Prepare user data
    user_data = {
        'id': str(user.id),
        'name': user.name,
        'email': user.email,
        'role': user.role,
    }
    
    # Add isHOD for Faculty users
    if user.role == 'Faculty' and hasattr(user, 'faculty_profile'):
        user_data['isHOD'] = user.faculty_profile.is_hod
    
    return Response({
        'user': user_data,
        'token': str(refresh.access_token),
        'refreshToken': str(refresh)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    POST /api/auth/logout
    Logout user and invalidate token.
    """
    try:
        refresh_token = request.data.get('refreshToken')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception:
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    GET /api/auth/me
    Get current authenticated user profile.
    """
    user = request.user
    user_data = {
        'id': str(user.id),
        'name': user.name,
        'email': user.email,
        'role': user.role,
    }
    
    # Add isHOD for Faculty users
    if user.role == 'Faculty' and hasattr(user, 'faculty_profile'):
        user_data['isHOD'] = user.faculty_profile.is_hod
    
    return Response(user_data)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    POST /api/auth/refresh
    Refresh JWT token.
    """
    refresh_token = request.data.get('refreshToken')
    
    if not refresh_token:
        return Response({
            'error': {
                'message': 'Refresh token is required',
                'code': 'VALIDATION_ERROR',
                'statusCode': 400
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'token': str(refresh.access_token)
        })
    except Exception as e:
        return Response({
            'error': {
                'message': 'Invalid or expired refresh token',
                'code': 'UNAUTHORIZED',
                'statusCode': 401
            }
        }, status=status.HTTP_401_UNAUTHORIZED)


# ============================================================================
# Attendance Request Views
# ============================================================================

class AttendanceRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AttendanceRequest CRUD operations.
    
    Endpoints:
    - GET /api/attendance/requests - List requests with filters
    - GET /api/attendance/requests/:id - Get single request
    - POST /api/attendance/requests - Create request(s)
    - PATCH /api/attendance/requests/:id/status - Update status
    - DELETE /api/attendance/requests/:id - Delete request
    """
    queryset = AttendanceRequest.objects.all()
    serializer_class = AttendanceRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset based on user role and query parameters."""
        user = self.request.user
        queryset = AttendanceRequest.objects.all()
        
        # Role-based filtering
        if user.role == 'Student':
            # Students see only their own requests
            queryset = queryset.filter(student=user)
        
        elif user.role == 'Faculty':
            if hasattr(user, 'faculty_profile'):
                is_hod = user.faculty_profile.is_hod
                # honor history query param
                history_param = self.request.query_params.get('history')
                history = str(history_param).lower() in ('1', 'true', 'yes')

                if is_hod:
                    # HOD: default shows PENDING_HOD; when history=true show all requests
                    if history:
                        queryset = queryset  # All requests
                    else:
                        queryset = queryset.filter(status='PENDING_HOD')
                else:
                    # Regular Faculty (Event Coordinator): 
                    # - Default shows PENDING_MENTOR requests where they are the event coordinator
                    # - History shows all requests where they were event coordinator (approved/declined by them)
                    if history:
                        # Show all requests where this faculty was the event coordinator
                        queryset = queryset.filter(event_coordinator_faculty=user).exclude(status='PENDING_MENTOR')
                    else:
                        # Show only PENDING_MENTOR where they are event coordinator
                        queryset = queryset.filter(status='PENDING_MENTOR', event_coordinator_faculty=user)
        
        # Apply query parameter filters
        student_id = self.request.query_params.get('studentId')
        status_filter = self.request.query_params.get('status')
        date_from = self.request.query_params.get('dateFrom')
        date_to = self.request.query_params.get('dateTo')
        
        if student_id:
            queryset = queryset.filter(student__id=student_id)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset.select_related('student')
    
    def create(self, request, *args, **kwargs):
        """
        Create attendance request(s) - supports single and multiple days.
        """
        if request.user.role != 'Student':
            return Response({
                'error': {
                    'message': 'Only students can create attendance requests',
                    'code': 'FORBIDDEN',
                    'statusCode': 403
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AttendanceRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        validated_data = serializer.validated_data
        created_requests = []
        
        # Handle single day request
        if 'date' in validated_data:
            # Get event coordinator faculty by ID
            event_coordinator_faculty_id = validated_data.get('eventCoordinatorFacultyId', validated_data.get('event_coordinator_faculty_id'))
            event_coordinator_faculty = None
            
            # Only try to get faculty if ID is provided and not empty
            if event_coordinator_faculty_id and event_coordinator_faculty_id.strip():
                try:
                    from .models import User
                    event_coordinator_faculty = User.objects.get(id=event_coordinator_faculty_id, role='Faculty')
                except (User.DoesNotExist, ValueError):
                    return Response({
                        'error': {
                            'message': 'Invalid event coordinator faculty ID',
                            'code': 'INVALID_FACULTY',
                            'statusCode': 400
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            attendance_request = AttendanceRequest.objects.create(
                student=request.user,
                date=validated_data['date'],
                periods=validated_data['periods'],
                period_faculty_mapping=validated_data.get('periodFacultyMapping', validated_data.get('period_faculty_mapping', {})),
                event_coordinator=validated_data.get('eventCoordinator', validated_data.get('event_coordinator')),
                event_coordinator_faculty=event_coordinator_faculty,
                proof_faculty=validated_data.get('proofFaculty', validated_data.get('proof_faculty')),
                purpose=validated_data['purpose'],
                status='PENDING_MENTOR'
            )
            created_requests.append(attendance_request)
        
        # Handle multiple days request
        elif 'requests' in validated_data:
            for req_data in validated_data['requests']:
                # Get event coordinator faculty by ID
                event_coordinator_faculty_id = req_data.get('eventCoordinatorFacultyId', req_data.get('event_coordinator_faculty_id'))
                event_coordinator_faculty = None
                
                # Only try to get faculty if ID is provided and not empty
                if event_coordinator_faculty_id and event_coordinator_faculty_id.strip():
                    try:
                        from .models import User
                        event_coordinator_faculty = User.objects.get(id=event_coordinator_faculty_id, role='Faculty')
                    except (User.DoesNotExist, ValueError):
                        return Response({
                            'error': {
                                'message': f'Invalid event coordinator faculty ID: {event_coordinator_faculty_id}',
                                'code': 'INVALID_FACULTY',
                                'statusCode': 400
                            }
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                attendance_request = AttendanceRequest.objects.create(
                    student=request.user,
                    date=req_data['date'],
                    periods=req_data['periods'],
                    period_faculty_mapping=req_data.get('periodFacultyMapping', req_data.get('period_faculty_mapping', {})),
                    event_coordinator=req_data.get('eventCoordinator', req_data.get('event_coordinator')),
                    event_coordinator_faculty=event_coordinator_faculty,
                    proof_faculty=req_data.get('proofFaculty', req_data.get('proof_faculty')),
                    purpose=req_data['purpose'],
                    status='PENDING_MENTOR'
                )
                created_requests.append(attendance_request)
        
        # Serialize response
        response_serializer = AttendanceRequestSerializer(created_requests, many=True)
        
        # Return single object for single day, array for multiple days
        if len(created_requests) == 1:
            return Response(response_serializer.data[0], status=status.HTTP_201_CREATED)
        else:
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete attendance request (only by student who created it and only if PENDING_MENTOR).
        """
        instance = self.get_object()
        
        # Check if user is the student who created the request
        if request.user != instance.student:
            return Response({
                'error': {
                    'message': 'You can only delete your own requests',
                    'code': 'FORBIDDEN',
                    'statusCode': 403
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if request is still PENDING_MENTOR
        if instance.status != 'PENDING_MENTOR':
            return Response({
                'error': {
                    'message': 'Can only delete requests with PENDING_MENTOR status',
                    'code': 'FORBIDDEN',
                    'statusCode': 403
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        """
        PATCH /api/attendance/requests/:id/status
        Update request status (approve/decline).
        """
        instance = self.get_object()
        serializer = AttendanceRequestStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data['status']
        reason = serializer.validated_data.get('reason', '')
        
        # Validate status transitions
        current_status = instance.status
        
        # Only Faculty can update status
        if request.user.role != 'Faculty':
            return Response({
                'error': {
                    'message': 'Only faculty can approve/decline requests',
                    'code': 'FORBIDDEN',
                    'statusCode': 403
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Mentor can only approve PENDING_MENTOR to PENDING_HOD or DECLINED
        if current_status == 'PENDING_MENTOR':
            if not hasattr(request.user, 'faculty_profile') or request.user.faculty_profile.is_hod:
                return Response({
                    'error': {
                        'message': 'Only mentors can approve PENDING_MENTOR requests',
                        'code': 'FORBIDDEN',
                        'statusCode': 403
                    }
                }, status=status.HTTP_403_FORBIDDEN)
            
            if new_status not in ['PENDING_HOD', 'DECLINED']:
                return Response({
                    'error': {
                        'message': 'Invalid status transition',
                        'code': 'INVALID_STATUS_TRANSITION',
                        'statusCode': 400
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # HOD can only approve PENDING_HOD to APPROVED or DECLINED
        elif current_status == 'PENDING_HOD':
            if not hasattr(request.user, 'faculty_profile') or not request.user.faculty_profile.is_hod:
                return Response({
                    'error': {
                        'message': 'Only HOD can approve PENDING_HOD requests',
                        'code': 'FORBIDDEN',
                        'statusCode': 403
                    }
                }, status=status.HTTP_403_FORBIDDEN)
            
            if new_status not in ['APPROVED', 'DECLINED']:
                return Response({
                    'error': {
                        'message': 'Invalid status transition',
                        'code': 'INVALID_STATUS_TRANSITION',
                        'statusCode': 400
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cannot change APPROVED or DECLINED status
        elif current_status in ['APPROVED', 'DECLINED']:
            return Response({
                'error': {
                    'message': f'{current_status} requests cannot be modified',
                    'code': 'INVALID_STATUS_TRANSITION',
                    'statusCode': 400
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update status
        instance.status = new_status
        if new_status == 'DECLINED':
            instance.reason = reason
        instance.save()
        
        # Send email notifications to period faculty when HOD approves
        if new_status == 'APPROVED' and current_status == 'PENDING_HOD':
            self._send_faculty_notifications(instance)
        
        # Serialize and return
        response_serializer = AttendanceRequestSerializer(instance)
        return Response(response_serializer.data)
    
    def _send_faculty_notifications(self, request_instance):
        """Send email notifications to faculty members for their respective periods."""
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            
            period_faculty_mapping = request_instance.period_faculty_mapping
            if not period_faculty_mapping:
                return
            
            # Get unique faculty IDs
            faculty_ids = set(period_faculty_mapping.values())
            
            for faculty_id in faculty_ids:
                try:
                    faculty_user = User.objects.get(id=faculty_id, role='Faculty')
                    
                    # Find which periods this faculty handles
                    their_periods = [period for period, fac_id in period_faculty_mapping.items() if fac_id == faculty_id]
                    periods_str = ', '.join(sorted(their_periods))
                    
                    # Email content
                    subject = f'Physical Attendance Approved - {request_instance.student.get_full_name()}'
                    message = f"""
Dear {faculty_user.get_full_name()},

A physical attendance request has been approved for your class(es).

Student Details:
- Name: {request_instance.student.get_full_name()}
- Email: {request_instance.student.email}
- Date: {request_instance.date.strftime('%B %d, %Y')}
- Your Period(s): {periods_str}

Event Details:
- Purpose: {request_instance.purpose}
- Event Coordinator: {request_instance.event_coordinator}

The student has been granted physical attendance for the above period(s) in your class.

Best regards,
Attendance Management System
                    """
                    
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[faculty_user.email],
                        fail_silently=True,
                    )
                except User.DoesNotExist:
                    continue
                except Exception as e:
                    print(f"Failed to send email to faculty {faculty_id}: {str(e)}")
                    continue
                    
        except Exception as e:
            print(f"Failed to send faculty notifications: {str(e)}")
            # Don't fail the request if email fails


# ============================================================================
# Faculty Views
# ============================================================================

class FacultyListView(generics.ListAPIView):
    """
    GET /api/faculty
    Get all faculty members.
    """
    queryset = Faculty.objects.select_related('user').all()
    serializer_class = FacultySerializer
    permission_classes = [IsAuthenticated]


class FacultyByDepartmentView(generics.ListAPIView):
    """
    GET /api/faculty/by-department/:department
    Get faculty by department.
    """
    serializer_class = FacultySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        department = self.kwargs.get('department')
        return Faculty.objects.select_related('user').filter(department=department)


# ============================================================================
# Statistics Views
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def statistics_view(request):
    """
    GET /api/attendance/statistics
    Get role-specific attendance statistics.
    """
    user = request.user
    
    if user.role == 'Student':
        # Student statistics
        total = AttendanceRequest.objects.filter(student=user).count()
        pending = AttendanceRequest.objects.filter(
            student=user,
            status__in=['PENDING_MENTOR', 'PENDING_HOD']
        ).count()
        approved = AttendanceRequest.objects.filter(student=user, status='APPROVED').count()
        declined = AttendanceRequest.objects.filter(student=user, status='DECLINED').count()
        
        return Response({
            'total': total,
            'pending': pending,
            'approved': approved,
            'declined': declined
        })
    
    elif user.role == 'Faculty':
        if hasattr(user, 'faculty_profile') and user.faculty_profile.is_hod:
            # HOD statistics (department-wide)
            total = AttendanceRequest.objects.count()
            pending_hod = AttendanceRequest.objects.filter(status='PENDING_HOD').count()
            approved = AttendanceRequest.objects.filter(status='APPROVED').count()
            declined = AttendanceRequest.objects.filter(status='DECLINED').count()
            
            return Response({
                'total': total,
                'pendingHOD': pending_hod,
                'approved': approved,
                'declined': declined
            })
        else:
            # Mentor statistics (assigned requests)
            total = AttendanceRequest.objects.count()
            pending_mentor = AttendanceRequest.objects.filter(status='PENDING_MENTOR').count()
            # Approved means moved to PENDING_HOD by mentor
            approved = AttendanceRequest.objects.filter(
                status__in=['PENDING_HOD', 'APPROVED']
            ).count()
            declined = AttendanceRequest.objects.filter(status='DECLINED').count()
            
            return Response({
                'total': total,
                'pendingMentor': pending_mentor,
                'approved': approved,
                'declined': declined
            })
    
    return Response({
        'error': {
            'message': 'Invalid user role',
            'code': 'FORBIDDEN',
            'statusCode': 403
        }
    }, status=status.HTTP_403_FORBIDDEN)
