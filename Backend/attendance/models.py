"""
Models for Physical Attendance Automation System.

Based on requirements from BACKEND_INTEGRATION.md
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator


class User(AbstractUser):
    """
    Custom User model with role-based authentication.
    Supports Student and Faculty roles.
    """
    ROLE_CHOICES = [
        ('Student', 'Student'),
        ('Faculty', 'Faculty'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    
    # Override username to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'role']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    @property
    def name(self):
        """Return full name for API compatibility."""
        return self.get_full_name() or self.username


class Faculty(models.Model):
    """
    Faculty profile with title, department, and HOD flag.
    Critical: is_hod determines dashboard access (Mentor vs HOD view).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='faculty_profile'
    )
    title = models.CharField(max_length=255, help_text="e.g., Professor, Associate Professor")
    department = models.CharField(max_length=255, help_text="e.g., Computer Science, Mathematics")
    is_hod = models.BooleanField(
        default=False,
        help_text="Determines if faculty sees Mentor queue or HOD queue"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'faculty'
        verbose_name = 'Faculty'
        verbose_name_plural = 'Faculty'
        indexes = [
            models.Index(fields=['department']),
            models.Index(fields=['is_hod']),
        ]
    
    def __str__(self):
        hod_suffix = " (HOD)" if self.is_hod else ""
        return f"{self.user.name} - {self.title}{hod_suffix}"


class Student(models.Model):
    """
    Student profile with university details.
    Optional but recommended for future features.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    student_id = models.CharField(max_length=50, unique=True, help_text="University Student ID")
    department = models.CharField(max_length=255)
    year = models.IntegerField(help_text="1, 2, 3, or 4")
    section = models.CharField(max_length=10, help_text="e.g., A, B, C")
    mentor = models.ForeignKey(
        Faculty,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mentees',
        help_text="Assigned faculty mentor"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'students'
        verbose_name = 'Student'
        verbose_name_plural = 'Students'
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['department']),
        ]
    
    def __str__(self):
        return f"{self.user.name} ({self.student_id})"


class AttendanceRequest(models.Model):
    """
    Attendance Request model for two-tier approval workflow.
    
    Workflow:
    1. Student creates request -> PENDING_MENTOR
    2. Mentor approves -> PENDING_HOD
    3. HOD approves -> APPROVED
    OR decline at any stage -> DECLINED (with reason)
    """
    STATUS_CHOICES = [
        ('PENDING_MENTOR', 'Pending (Mentor)'),
        ('PENDING_HOD', 'Pending (HOD)'),
        ('APPROVED', 'Approved'),
        ('DECLINED', 'Declined'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='attendance_requests',
        limit_choices_to={'role': 'Student'}
    )
    date = models.DateField(help_text="Date of attendance request")
    periods = models.JSONField(
        default=list,
        help_text="Array of period numbers [1-8] e.g., [1, 2, 3, 4]"
    )
    event_coordinator = models.CharField(
        max_length=255,
        help_text="Name of faculty coordinating the event"
    )
    proof_faculty = models.CharField(
        max_length=255,
        help_text="Name of faculty who can verify attendance"
    )
    purpose = models.TextField(
        validators=[MinLengthValidator(10)],
        help_text="Reason for attendance request (min 10 characters)"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING_MENTOR'
    )
    reason = models.TextField(
        null=True,
        blank=True,
        help_text="Required when status is DECLINED"
    )
    proof_url = models.URLField(
        null=True,
        blank=True,
        help_text="URL to uploaded proof document (future feature)"
    )
    
    # Tracking fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'attendance_requests'
        verbose_name = 'Attendance Request'
        verbose_name_plural = 'Attendance Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['status', 'date']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.get_status_display()}"
    
    def clean(self):
        """Validate model data."""
        from django.core.exceptions import ValidationError
        
        # Validate periods are integers 1-8
        if not isinstance(self.periods, list):
            raise ValidationError("Periods must be a list of integers")
        
        if not all(isinstance(p, int) and 1 <= p <= 8 for p in self.periods):
            raise ValidationError("Periods must be integers between 1 and 8")
        
        if len(self.periods) == 0:
            raise ValidationError("At least one period must be selected")
        
        # Validate reason required when declined
        if self.status == 'DECLINED' and not self.reason:
            raise ValidationError("Reason is required when status is DECLINED")
    
    def save(self, *args, **kwargs):
        """Save without calling full_clean to avoid validation issues."""
        # Only validate periods and reason, skip other validations
        if not isinstance(self.periods, list) or len(self.periods) == 0:
            from django.core.exceptions import ValidationError
            raise ValidationError("At least one period must be selected")
        
        if self.status == 'DECLINED' and not self.reason:
            from django.core.exceptions import ValidationError
            raise ValidationError("Reason is required when status is DECLINED")
        
        super().save(*args, **kwargs)
