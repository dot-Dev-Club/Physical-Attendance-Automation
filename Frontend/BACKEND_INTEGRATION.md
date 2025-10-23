# Backend Integration Guide

This document outlines the requirements for the Django backend API to integrate with the frontend.

## 📋 Required API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
Login user and return JWT token.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "student@example.com",
    "role": "Student"  // or "Faculty"
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

#### POST `/api/auth/logout`
Logout user and invalidate token.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

#### GET `/api/auth/me`
Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "student@example.com",
  "role": "Student"
}
```

#### POST `/api/auth/refresh`
Refresh JWT token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "token": "new_jwt_token_here"
}
```

---

### Attendance Request Endpoints

#### GET `/api/attendance/requests`
Get attendance requests (with filters).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `studentId` (optional) - Filter by student
- `status` (optional) - Filter by status: `Pending (Mentor)`, `Pending (HOD)`, `Approved`, `Declined`
- `dateFrom` (optional) - Filter from date (YYYY-MM-DD)
- `dateTo` (optional) - Filter to date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": "uuid",
    "studentId": "student_uuid",
    "studentName": "John Doe",
    "date": "2024-10-25",
    "periods": [1, 2, 3],
    "eventCoordinator": "Dr. Smith",
    "proofFaculty": "Dr. Johnson",
    "purpose": "Attending workshop on AI",
    "status": "Pending (Mentor)",
    "reason": null,
    "createdAt": "2024-10-23T10:00:00Z",
    "updatedAt": "2024-10-23T10:00:00Z"
  }
]
```

#### GET `/api/attendance/requests/:id`
Get single attendance request by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** Same as single request object above.

#### POST `/api/attendance/requests`
Create new attendance request.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "date": "2024-10-25",
  "periods": [1, 2, 3],
  "eventCoordinator": "Dr. Smith",
  "proofFaculty": "Dr. Johnson",
  "purpose": "Attending workshop on AI"
}
```

**Response:** Created request object (same structure as GET).

**Status Code:** `201 Created`

#### PATCH `/api/attendance/requests/:id/status`
Update request status (approve/decline).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "Approved",  // or "Declined", "Pending (HOD)"
  "reason": "Optional decline reason"
}
```

**Response:** Updated request object.

#### DELETE `/api/attendance/requests/:id`
Delete attendance request (only by student who created it).

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

#### POST `/api/attendance/requests/:id/proof`
Upload proof document for attendance request.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request:** FormData with file

**Response:**
```json
{
  "proofUrl": "https://storage.example.com/proof123.pdf"
}
```

---

### Faculty Endpoints

#### GET `/api/faculty`
Get all faculty members.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Dr. Smith",
    "title": "Professor, Computer Science",
    "department": "Computer Science",
    "email": "smith@example.com"
  }
]
```

#### GET `/api/faculty/by-department/:department`
Get faculty by department.

**Headers:** `Authorization: Bearer <token>`

**Response:** Same as all faculty endpoint.

---

## 🔒 Authentication & Authorization

### JWT Token
- Include JWT token in `Authorization: Bearer <token>` header for all protected endpoints
- Token expiry: 1 hour recommended
- Refresh token expiry: 7 days recommended

### Role-Based Access Control

**Student Role:**
- Can create attendance requests
- Can view own requests
- Cannot approve/decline requests

**Faculty Role (Mentor):**
- Can view all requests with `Pending (Mentor)` status
- Can approve (moves to `Pending (HOD)`) or decline requests

**Faculty Role (HOD):**
- Can view all requests with `Pending (HOD)` status
- Can approve (moves to `Approved`) or decline requests
- Can view all requests for history

---

## 📊 Data Models

### User Model
```python
class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # Hashed
    role = models.CharField(choices=[('Student', 'Student'), ('Faculty', 'Faculty')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Attendance Request Model
```python
class AttendanceRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending (Mentor)', 'Pending (Mentor)'),
        ('Pending (HOD)', 'Pending (HOD)'),
        ('Approved', 'Approved'),
        ('Declined', 'Declined'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    date = models.DateField()
    periods = models.JSONField()  # Array of integers [1, 2, 3]
    event_coordinator = models.CharField(max_length=255)
    proof_faculty = models.CharField(max_length=255)
    purpose = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending (Mentor)')
    reason = models.TextField(null=True, blank=True)  # Decline reason
    proof_url = models.URLField(null=True, blank=True)  # Document proof
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Faculty Model
```python
class Faculty(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)  # "Professor", "Asst. Professor", etc.
    department = models.CharField(max_length=255)
    is_hod = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## 🚨 Error Responses

All error responses should follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401) - Invalid or missing token
- `FORBIDDEN` (403) - User doesn't have permission
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid request data
- `SERVER_ERROR` (500) - Internal server error

---

## 🔧 CORS Configuration

Enable CORS for frontend development:
- Allow origin: `http://localhost:3000`
- Allow methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Allow headers: `Content-Type, Authorization`

---

## 📝 Additional Notes

### Date Format
- Use ISO 8601 format: `YYYY-MM-DD` for dates
- Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ` for timestamps

### Pagination
Consider adding pagination for list endpoints:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

### Rate Limiting
Implement rate limiting to prevent abuse:
- Auth endpoints: 5 requests per minute
- Other endpoints: 60 requests per minute

---

## 🧪 Testing

Please provide:
1. Postman/Insomnia collection for API testing
2. Sample test data for development
3. API documentation (Swagger/OpenAPI)

---

## 📞 Questions?

Contact the frontend developer for any clarifications or changes needed.
