"""
Serializers for Physical Attendance Automation API.

Based on BACKEND_INTEGRATION.md specifications.
"""
from rest_framework import serializers
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
        
        # Try to get user by email first
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")
        
        # Check password
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password")
        
        # Verify role matches
        if user.role != role:
            raise serializers.ValidationError(f"Invalid credentials for {role} login")
        
        data['user'] = user
        return data


class FacultySerializer(serializers.ModelSerializer):
    """Serializer for Faculty with user information."""
    
    id = serializers.UUIDField(source='user.id', read_only=True)
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    isHOD = serializers.BooleanField(source='is_hod', read_only=True)
    
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'title', 'department', 'email', 'isHOD']


class AttendanceRequestSerializer(serializers.ModelSerializer):
    """Serializer for AttendanceRequest."""
    
    studentId = serializers.UUIDField(source='student.id', read_only=True, allow_null=True)
    studentName = serializers.CharField(source='student.name', read_only=True, allow_null=True)
    studentEmail = serializers.EmailField(source='student.email', read_only=True, allow_null=True)
    isBulkRequest = serializers.BooleanField(source='is_bulk_request', read_only=True)
    bulkStudents = serializers.JSONField(source='bulk_students', read_only=True)
    createdBy = serializers.UUIDField(source='created_by.id', read_only=True, allow_null=True)
    createdByName = serializers.CharField(source='created_by.name', read_only=True, allow_null=True)
    eventCoordinator = serializers.CharField(source='event_coordinator')
    eventCoordinatorFacultyId = serializers.UUIDField(source='event_coordinator_faculty.id', read_only=True, allow_null=True)
    eventCoordinatorFacultyName = serializers.CharField(source='event_coordinator_faculty.name', read_only=True, allow_null=True)
    proofFaculty = serializers.CharField(source='proof_faculty')
    periodFacultyMapping = serializers.JSONField(source='period_faculty_mapping', required=False)
    proofUrl = serializers.URLField(source='proof_url', read_only=True, allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = AttendanceRequest
        fields = [
            'id', 'studentId', 'studentName', 'studentEmail',
            'isBulkRequest', 'bulkStudents', 'createdBy', 'createdByName',
            'date', 'periods', 'periodFacultyMapping', 'eventCoordinator', 'eventCoordinatorFacultyId', 'eventCoordinatorFacultyName', 'proofFaculty',
            'purpose', 'status', 'reason', 'proofUrl',
            'createdAt', 'updatedAt'
        ]
        read_only_fields = ['id', 'status', 'studentId', 'studentName', 'studentEmail', 'isBulkRequest', 'bulkStudents', 'createdBy', 'createdByName', 'createdAt', 'updatedAt']
    
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
    """Serializer for creating attendance requests (single student or bulk)."""
    
    # Common fields
    date = serializers.DateField(required=True)
    periods = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=8),
        required=True
    )
    periodFacultyMapping = serializers.JSONField(required=False)
    eventCoordinator = serializers.CharField(max_length=255, required=True)
    eventCoordinatorFacultyId = serializers.UUIDField(required=False, allow_null=True)
    proofFaculty = serializers.CharField(max_length=255, required=True)
    purpose = serializers.CharField(required=True)
    
    # Bulk request field
    bulkStudents = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=False,
        help_text="Array of {registerNumber, name} for bulk requests"
    )
    
    def validate(self, data):
        """Validate request data."""
        
        # Validate purpose length
        if len(data['purpose']) < 10:
            raise serializers.ValidationError("Purpose must be at least 10 characters")
        
        # Validate eventCoordinatorFacultyId if provided
        if 'eventCoordinatorFacultyId' in data and data['eventCoordinatorFacultyId']:
            import uuid
            try:
                faculty_id_str = str(data['eventCoordinatorFacultyId']).strip() if isinstance(data['eventCoordinatorFacultyId'], str) else str(data['eventCoordinatorFacultyId'])
                if faculty_id_str:
                    uuid.UUID(faculty_id_str)
            except ValueError:
                raise serializers.ValidationError("eventCoordinatorFacultyId must be a valid UUID")
        
        # Validate bulkStudents structure if provided
        if 'bulkStudents' in data and data['bulkStudents']:
            for student in data['bulkStudents']:
                if 'registerNumber' not in student or 'name' not in student:
                    raise serializers.ValidationError("Each bulk student must have registerNumber and name")
                if not student['registerNumber'] or not student['name']:
                    raise serializers.ValidationError("Register number and name cannot be empty")
        
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
