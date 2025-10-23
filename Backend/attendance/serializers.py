"""
Serializers for Physical Attendance Automation API.

Based on BACKEND_INTEGRATION.md specifications.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Faculty, Student, AttendanceRequest


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with role information."""
    
    name = serializers.CharField(source='get_full_name', read_only=True)
    isHOD = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'isHOD']
        read_only_fields = ['id']
    
    def get_isHOD(self, obj):
        """Return isHOD flag for Faculty users only."""
        if obj.role == 'Faculty' and hasattr(obj, 'faculty_profile'):
            return obj.faculty_profile.is_hod
        return None


class LoginSerializer(serializers.Serializer):
    """Serializer for login endpoint."""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['Student', 'Faculty'])
    
    def validate(self, data):
        """Validate credentials and role."""
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        
        if not email or not password:
            raise serializers.ValidationError("Email and password are required")
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        
        if not user:
            raise serializers.ValidationError({
                'error': {
                    'message': 'Invalid email or password',
                    'code': 'INVALID_CREDENTIALS',
                    'statusCode': 401
                }
            })
        
        # Verify role matches
        if user.role != role:
            raise serializers.ValidationError({
                'error': {
                    'message': f'User is not a {role}',
                    'code': 'INVALID_CREDENTIALS',
                    'statusCode': 401
                }
            })
        
        data['user'] = user
        return data


class FacultySerializer(serializers.ModelSerializer):
    """Serializer for Faculty with user information."""
    
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    isHOD = serializers.BooleanField(source='is_hod', read_only=True)
    
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'title', 'department', 'email', 'isHOD']


class AttendanceRequestSerializer(serializers.ModelSerializer):
    """Serializer for AttendanceRequest."""
    
    studentId = serializers.UUIDField(source='student.id', read_only=True)
    studentName = serializers.CharField(source='student.name', read_only=True)
    studentEmail = serializers.EmailField(source='student.email', read_only=True)
    eventCoordinator = serializers.CharField(source='event_coordinator')
    proofFaculty = serializers.CharField(source='proof_faculty')
    proofUrl = serializers.URLField(source='proof_url', read_only=True, allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = AttendanceRequest
        fields = [
            'id', 'studentId', 'studentName', 'studentEmail',
            'date', 'periods', 'eventCoordinator', 'proofFaculty',
            'purpose', 'status', 'reason', 'proofUrl',
            'createdAt', 'updatedAt'
        ]
        read_only_fields = ['id', 'status', 'studentId', 'studentName', 'studentEmail', 'createdAt', 'updatedAt']
    
    def validate_periods(self, value):
        """Validate periods are integers 1-8."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Periods must be a list of integers")
        
        if not value:
            raise serializers.ValidationError("At least one period must be selected")
        
        if not all(isinstance(p, int) and 1 <= p <= 8 for p in value):
            raise serializers.ValidationError("Periods must be integers between 1 and 8")
        
        return value
    
    def validate_purpose(self, value):
        """Validate purpose has minimum length."""
        if len(value) < 10:
            raise serializers.ValidationError("Purpose must be at least 10 characters")
        return value


class AttendanceRequestCreateSerializer(serializers.Serializer):
    """Serializer for creating attendance requests (single or multiple days)."""
    
    # Single day request fields
    date = serializers.DateField(required=False)
    periods = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=8),
        required=False
    )
    eventCoordinator = serializers.CharField(max_length=255, required=False)
    proofFaculty = serializers.CharField(max_length=255, required=False)
    purpose = serializers.CharField(required=False)
    
    # Multiple days request field
    requests = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    
    def validate(self, data):
        """Validate either single day or multiple days format."""
        has_single = 'date' in data
        has_multiple = 'requests' in data
        
        if has_single and has_multiple:
            raise serializers.ValidationError("Cannot provide both single day and multiple days format")
        
        if not has_single and not has_multiple:
            raise serializers.ValidationError("Must provide either single day or multiple days format")
        
        # Validate single day format
        if has_single:
            required_fields = ['date', 'periods', 'eventCoordinator', 'proofFaculty', 'purpose']
            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError(f"{field} is required for single day request")
            
            if len(data['purpose']) < 10:
                raise serializers.ValidationError("Purpose must be at least 10 characters")
        
        # Validate multiple days format
        if has_multiple:
            if not data['requests']:
                raise serializers.ValidationError("Requests array cannot be empty")
            
            for req in data['requests']:
                required_fields = ['date', 'periods', 'eventCoordinator', 'proofFaculty', 'purpose']
                for field in required_fields:
                    if field not in req:
                        raise serializers.ValidationError(f"{field} is required in each request")
                
                if len(req['purpose']) < 10:
                    raise serializers.ValidationError("Purpose must be at least 10 characters")
        
        return data


class AttendanceRequestStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating attendance request status."""
    
    status = serializers.ChoiceField(
        choices=['PENDING_HOD', 'APPROVED', 'DECLINED']
    )
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate reason is provided when declining."""
        if data['status'] == 'DECLINED' and not data.get('reason'):
            raise serializers.ValidationError({
                'error': {
                    'message': 'Reason is required when declining a request',
                    'code': 'MISSING_DECLINE_REASON',
                    'statusCode': 400
                }
            })
        return data
