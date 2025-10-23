# Backend Integration Guide

This document outlines the requirements for the Django backend API to integrate with the Physical Attendance Automation System frontend.

## 🎯 System Overview

The system has three distinct user roles with separate authentication and workflows:
1. **Students** - Submit attendance requests for events/activities
2. **Faculty (Mentors)** - First-level approval of student requests
3. **HODs (Head of Department)** - Second-level approval after mentor approval

### Key Features Implemented
- ✅ Separate Student/Faculty login interface
- ✅ Role-based dashboards (Student/Faculty/HOD)
- ✅ Two-tier approval workflow (Faculty → HOD → Approved)
- ✅ Multiple-day attendance requests with individual period selection per day
- ✅ Real-time statistics and status tracking
- ✅ Request management (view, approve, decline, delete)

---

## 📋 Required API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
Login user and return JWT token with role information.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "role": "Student"  // or "Faculty"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "student@example.com",
    "role": "Student",  // or "Faculty"
    "isHOD": false  // Only for Faculty role, indicates if user is HOD
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

**Important Notes:**
- Frontend has separate Student and Faculty login options
- `isHOD` field is **critical** for Faculty users - it determines dashboard access
- HODs are Faculty members with `isHOD: true` flag
- Students do not have the `isHOD` field

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
  "role": "Student",  // or "Faculty"
  "isHOD": false  // Only present for Faculty role
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
- `studentId` (optional) - Filter by student ID
- `status` (optional) - Filter by status: `PENDING_MENTOR`, `PENDING_HOD`, `APPROVED`, `DECLINED`
- `dateFrom` (optional) - Filter from date (YYYY-MM-DD)
- `dateTo` (optional) - Filter to date (YYYY-MM-DD)
- `mentorId` (optional) - Filter by mentor faculty ID (for Faculty dashboard)
- `department` (optional) - Filter by department (for HOD dashboard)

**Response:**
```json
[
  {
    "id": "uuid",
    "studentId": "student_uuid",
    "studentName": "John Doe",
    "studentEmail": "john.doe@university.edu",
    "date": "2024-10-25",
    "periods": [1, 2, 3],
    "eventCoordinator": "Dr. Smith",
    "proofFaculty": "Dr. Johnson",
    "purpose": "Attending workshop on AI",
    "status": "PENDING_MENTOR",  // or PENDING_HOD, APPROVED, DECLINED
    "reason": null,  // Decline reason if status is DECLINED
    "createdAt": "2024-10-23T10:00:00Z",
    "updatedAt": "2024-10-23T10:00:00Z"
  }
]
```

**Important Notes:**
- Frontend uses status constants: `PENDING_MENTOR`, `PENDING_HOD`, `APPROVED`, `DECLINED`
- Faculty (Mentors) should see only requests with `PENDING_MENTOR` status
- HODs should see only requests with `PENDING_HOD` status
- Students see all their own requests regardless of status

#### GET `/api/attendance/requests/:id`
Get single attendance request by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** Same as single request object above.

#### POST `/api/attendance/requests`
Create new attendance request(s).

**Headers:** `Authorization: Bearer <token>`

**Request (Single Day):**
```json
{
  "date": "2024-10-25",
  "periods": [1, 2, 3],
  "eventCoordinator": "Dr. Smith",
  "proofFaculty": "Dr. Johnson",
  "purpose": "Attending workshop on AI"
}
```

**Request (Multiple Days):**
```json
{
  "requests": [
    {
      "date": "2024-10-25",
      "periods": [1, 2, 3],
      "eventCoordinator": "Dr. Smith",
      "proofFaculty": "Dr. Johnson",
      "purpose": "Attending workshop on AI"
    },
    {
      "date": "2024-10-26",
      "periods": [1, 2, 4, 5],
      "eventCoordinator": "Dr. Smith",
      "proofFaculty": "Dr. Johnson",
      "purpose": "Attending workshop on AI"
    }
  ]
}
```

**Response:** 
- Single day: Created request object (same structure as GET)
- Multiple days: Array of created request objects

**Status Code:** `201 Created`

**Important Notes:**
- Frontend supports both single and multiple-day requests
- Multiple-day requests allow **different period selection for each day**
- Each day in a date range creates a **separate request** in the database
- All requests start with status `PENDING_MENTOR`
- Frontend automatically generates one request per day with selected periods

#### PATCH `/api/attendance/requests/:id/status`
Update request status (approve/decline).

**Headers:** `Authorization: Bearer <token>`

**Request (Mentor Approval):**
```json
{
  "status": "PENDING_HOD"  // Mentor approves, moves to HOD queue
}
```

**Request (Mentor Decline):**
```json
{
  "status": "DECLINED",
  "reason": "Event does not qualify for attendance exemption"
}
```

**Request (HOD Approval):**
```json
{
  "status": "APPROVED"  // HOD approves, final approval
}
```

**Request (HOD Decline):**
```json
{
  "status": "DECLINED",
  "reason": "Insufficient justification for attendance exemption"
}
```

**Response:** Updated request object with new status.

**Important Notes:**
- **Two-tier approval workflow:**
  1. Student submits → Status: `PENDING_MENTOR`
  2. Mentor approves → Status: `PENDING_HOD`
  3. HOD approves → Status: `APPROVED`
- **Decline at any level:** Status becomes `DECLINED` with required reason
- Only Faculty (Mentor) can approve `PENDING_MENTOR` → `PENDING_HOD`
- Only HOD can approve `PENDING_HOD` → `APPROVED`
- `reason` field is **required** when status is `DECLINED`

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
Get all faculty members (for dropdown selections in student forms).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Dr. Smith",
    "title": "Professor, Computer Science",
    "department": "Computer Science",
    "email": "smith@university.edu",
    "isHOD": false
  },
  {
    "id": "uuid",
    "name": "Dr. Maria Chen",
    "title": "Professor, Computer Science (HOD)",
    "department": "Computer Science",
    "email": "maria.chen@university.edu",
    "isHOD": true
  }
]
```

**Important Notes:**
- Used in student forms for Event Coordinator and Proof Faculty dropdowns
- `isHOD` flag indicates department heads
- Frontend displays title with "(HOD)" suffix for HOD users

#### GET `/api/faculty/by-department/:department`
Get faculty by department.

**Headers:** `Authorization: Bearer <token>`

**Response:** Same as all faculty endpoint.

---

### Statistics Endpoints

#### GET `/api/attendance/statistics`
Get attendance statistics for the logged-in user (role-specific).

**Headers:** `Authorization: Bearer <token>`

**Response (Student):**
```json
{
  "total": 15,
  "pending": 5,  // PENDING_MENTOR + PENDING_HOD combined
  "approved": 8,
  "declined": 2
}
```

**Response (Faculty - Mentor):**
```json
{
  "total": 45,  // All requests assigned to this mentor
  "pendingMentor": 12,  // Requests in PENDING_MENTOR status
  "approved": 28,  // Requests moved to PENDING_HOD by this mentor
  "declined": 5  // Requests declined by this mentor
}
```

**Response (Faculty - HOD):**
```json
{
  "total": 78,  // All requests in department
  "pendingHOD": 15,  // Requests in PENDING_HOD status
  "approved": 55,  // Requests with final APPROVED status
  "declined": 8  // Requests declined at any level
}
```

**Important Notes:**
- Statistics are calculated based on user role and permissions
- Faculty (Mentor) sees only requests assigned to them
- HOD sees department-wide statistics
- Used for dashboard statistics cards

---

## 🔒 Authentication & Authorization

### JWT Token
- Include JWT token in `Authorization: Bearer <token>` header for all protected endpoints
- Token expiry: 1 hour recommended
- Refresh token expiry: 7 days recommended

### Role-Based Access Control

#### Student Role
**Permissions:**
- ✅ Create attendance requests (single or multiple days)
- ✅ View own requests (all statuses)
- ✅ Delete own requests (only if status is `PENDING_MENTOR`)
- ❌ Cannot approve/decline any requests
- ❌ Cannot view other students' requests

**Dashboard Features:**
- Total requests submitted
- Pending requests (PENDING_MENTOR + PENDING_HOD)
- Approved requests
- Declined requests
- Submit new request form (single/multiple days)
- View all own requests in table

#### Faculty Role (Mentor)
**Permissions:**
- ✅ View requests with status `PENDING_MENTOR` (assigned to them)
- ✅ Approve requests: `PENDING_MENTOR` → `PENDING_HOD`
- ✅ Decline requests: `PENDING_MENTOR` → `DECLINED` (with reason)
- ❌ Cannot view `PENDING_HOD` requests (HOD queue)
- ❌ Cannot give final approval
- ❌ Cannot create requests

**Dashboard Features:**
- Total requests assigned
- Mentor queue count (PENDING_MENTOR only)
- Approved count (requests they moved to PENDING_HOD)
- Declined count (requests they declined)
- Attendance table showing only PENDING_MENTOR requests

#### Faculty Role (HOD)
**Permissions:**
- ✅ View requests with status `PENDING_HOD` (department-wide)
- ✅ Give final approval: `PENDING_HOD` → `APPROVED`
- ✅ Decline requests: `PENDING_HOD` → `DECLINED` (with reason)
- ✅ View historical data for all requests
- ❌ Cannot view `PENDING_MENTOR` requests (mentor queue)
- ❌ Cannot create requests

**Dashboard Features:**
- Total requests in department
- HOD queue count (PENDING_HOD only)
- Approved count (final approvals)
- Declined count (HOD-level declines)
- Attendance table showing only PENDING_HOD requests
- "HOD" badge displayed in header instead of "Faculty"

**Critical Implementation Notes:**
1. `isHOD` flag determines which queue faculty sees:
   - `isHOD: false` → Shows PENDING_MENTOR requests
   - `isHOD: true` → Shows PENDING_HOD requests
2. HODs use the same Faculty login, distinguished only by `isHOD` flag
3. Dashboard UI is completely different for Faculty vs HOD roles
4. Statistics cards show only relevant metrics per role

---

## 📊 Data Models

### User Model
```python
class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # Hashed with bcrypt or similar
    role = models.CharField(
        max_length=20,
        choices=[('Student', 'Student'), ('Faculty', 'Faculty')]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Faculty Model
```python
class Faculty(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    title = models.CharField(max_length=255)  # "Professor", "Associate Professor", etc.
    department = models.CharField(max_length=255)  # "Computer Science", "Mathematics", etc.
    is_hod = models.BooleanField(default=False)  # CRITICAL: Determines dashboard access
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Faculty"
```

**Important Notes:**
- `is_hod` flag is **critical** for role-based dashboard rendering
- HODs are regular faculty with `is_hod=True`
- When returning Faculty user in login, include: `isHOD: faculty_profile.is_hod`

### Student Model (Optional but Recommended)
```python
class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=50, unique=True)  # University ID
    department = models.CharField(max_length=255)
    year = models.IntegerField()  # 1, 2, 3, 4
    section = models.CharField(max_length=10)  # "A", "B", etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Attendance Request Model
```python
class AttendanceRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING_MENTOR', 'Pending (Mentor)'),
        ('PENDING_HOD', 'Pending (HOD)'),
        ('APPROVED', 'Approved'),
        ('DECLINED', 'Declined'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_requests')
    date = models.DateField()
    periods = models.JSONField()  # Array of integers: [1, 2, 3, 4, 5, 6, 7, 8]
    event_coordinator = models.CharField(max_length=255)  # Faculty name
    proof_faculty = models.CharField(max_length=255)  # Faculty name
    purpose = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING_MENTOR'
    )
    reason = models.TextField(null=True, blank=True)  # Required when status is DECLINED
    proof_url = models.URLField(null=True, blank=True)  # Document proof (future feature)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['status', 'date']),
        ]
```

**Important Notes:**
- `periods` is a JSON array: `[1, 2, 3]` (period numbers 1-8)
- Frontend sends period numbers as integers (1-8)
- `reason` is mandatory when `status` is set to `DECLINED`
- Multiple-day requests create separate database entries (one per day)
- Initial status is always `PENDING_MENTOR`

---

## � Complete Workflow

### Student Request Submission

1. **Student logs in** via Student login tab
2. **Fills request form** with:
   - Single day or multiple days option
   - Date selection (single or date range)
   - For each day: Individual period selection (1-8)
   - Event Coordinator (faculty dropdown)
   - Proof Faculty (faculty dropdown)
   - Purpose (text area)
3. **Submits request(s)**
   - Single day: Creates 1 request with status `PENDING_MENTOR`
   - Multiple days: Creates N requests (one per day) with status `PENDING_MENTOR`
4. **Views requests** in dashboard table with real-time status

### Faculty (Mentor) Approval Process

1. **Faculty logs in** via Faculty login tab (with `isHOD: false`)
2. **Sees Mentor Dashboard** with:
   - Statistics: Total, Mentor Queue, Approved, Declined
   - Table showing only `PENDING_MENTOR` requests
3. **Reviews request** and clicks "Approve" or "Decline"
4. **If Approve**: Status changes to `PENDING_HOD` (moves to HOD queue)
5. **If Decline**: Must provide reason, status changes to `DECLINED`

### HOD Approval Process

1. **HOD logs in** via Faculty login tab (with `isHOD: true`)
2. **Sees HOD Dashboard** with:
   - Statistics: Total, HOD Queue, Approved, Declined
   - Table showing only `PENDING_HOD` requests
   - Header shows "HOD" badge instead of "Faculty"
3. **Reviews request** and clicks "Approve" or "Decline"
4. **If Approve**: Status changes to `APPROVED` (final approval)
5. **If Decline**: Must provide reason, status changes to `DECLINED`

### Status Flow Diagram

```
┌─────────────────┐
│  Student        │
│  Submits        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PENDING_MENTOR  │◄─── Faculty (Mentor) sees this
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│DECLINED │ │PENDING_HOD   │◄─── HOD sees this
└─────────┘ └──────┬───────┘
                   │
              ┌────┴────┐
              │         │
              ▼         ▼
        ┌─────────┐ ┌─────────┐
        │DECLINED │ │APPROVED │
        └─────────┘ └─────────┘
```

---

## �🚨 Error Responses

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
- `FORBIDDEN` (403) - User doesn't have permission for this action
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid request data
- `INVALID_CREDENTIALS` (401) - Wrong email or password
- `INVALID_STATUS_TRANSITION` (400) - Cannot change from current status to requested status
- `MISSING_DECLINE_REASON` (400) - Reason required when declining
- `SERVER_ERROR` (500) - Internal server error

### Validation Rules

**Attendance Request Creation:**
- Date must be in the past (for retroactive attendance)
- Periods must be array of integers 1-8
- At least one period must be selected
- Event Coordinator and Proof Faculty are required
- Purpose must be at least 10 characters

**Status Updates:**
- Only `PENDING_MENTOR` can transition to `PENDING_HOD` or `DECLINED`
- Only `PENDING_HOD` can transition to `APPROVED` or `DECLINED`
- `APPROVED` and `DECLINED` are final states (no further changes)
- `reason` field is required when status is `DECLINED`

---

## 🔧 CORS Configuration

Enable CORS for frontend development:
- Allow origin: `http://localhost:5173` (Vite dev server)
- Allow methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Allow headers: `Content-Type, Authorization`
- Allow credentials: `true` (for cookies if using session auth)

---

## 📝 Additional Notes

### Date Format
- Use ISO 8601 format: `YYYY-MM-DD` for dates
- Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ` for timestamps
- Timezone: Use UTC for all timestamps

### Periods Mapping
Frontend uses 8 periods per day:
- Period 1: 08:30 - 09:20
- Period 2: 09:20 - 10:10
- Period 3: 10:30 - 11:20
- Period 4: 11:20 - 12:10
- Period 5: 13:00 - 13:50
- Period 6: 13:50 - 14:40
- Period 7: 14:50 - 15:40
- Period 8: 15:40 - 16:30

Store as JSON array of integers: `[1, 2, 3, 4, 5, 6, 7, 8]`

### Pagination
For list endpoints with potentially large datasets:

**Query Parameters:**
- `page` (default: 1) - Current page number
- `pageSize` (default: 20) - Items per page
- `sortBy` (default: "createdAt") - Sort field
- `sortOrder` (default: "desc") - Sort direction ("asc" or "desc")

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Rate Limiting
Implement rate limiting to prevent abuse:
- Auth endpoints: 5 requests per minute per IP
- Other endpoints: 60 requests per minute per user
- Return `429 Too Many Requests` when limit exceeded

### Caching Strategy
Frontend uses SessionStorage for temporary caching:
- User session data (cleared on browser close)
- Faculty list (refreshed on each session)
- **Note**: No long-term localStorage used for security

---

## 🧪 Testing & Development

### Sample Test Data

**Students:**
```json
[
  { "name": "Dickson", "email": "dickson@university.edu", "password": "student123" },
  { "name": "Niranjan", "email": "niranjan@university.edu", "password": "student123" },
  { "name": "Gokul", "email": "gokul@university.edu", "password": "student123" },
  { "name": "Earnest", "email": "earnest@university.edu", "password": "student123" }
]
```

**Faculty (Regular Mentors):**
```json
[
  {
    "name": "Dr. Evelyn Reed",
    "email": "evelyn.reed@university.edu",
    "password": "faculty123",
    "title": "Professor, Computer Science",
    "department": "Computer Science",
    "isHOD": false
  },
  {
    "name": "Dr. Robert Chen",
    "email": "robert.chen@university.edu",
    "password": "faculty123",
    "title": "Associate Professor, Mathematics",
    "department": "Mathematics",
    "isHOD": false
  }
]
```

**Faculty (HODs):**
```json
[
  {
    "name": "Dr. Maria Chen",
    "email": "maria.chen@university.edu",
    "password": "faculty123",
    "title": "Professor, Computer Science (HOD)",
    "department": "Computer Science",
    "isHOD": true
  },
  {
    "name": "Dr. James Anderson",
    "email": "james.anderson@university.edu",
    "password": "faculty123",
    "title": "Professor, Information Technology (HOD)",
    "department": "Information Technology",
    "isHOD": true
  }
]
```

### Testing Workflow

1. **Create test users** with the sample data above
2. **Test Student Flow:**
   - Login as Dickson
   - Create single-day request
   - Create multiple-day request (3 days with different periods)
   - View requests in dashboard
   
3. **Test Faculty (Mentor) Flow:**
   - Login as Dr. Evelyn Reed
   - Verify dashboard shows only PENDING_MENTOR requests
   - Approve a request (should move to PENDING_HOD)
   - Decline a request with reason
   
4. **Test HOD Flow:**
   - Login as Dr. Maria Chen
   - Verify dashboard shows "HOD" badge
   - Verify dashboard shows only PENDING_HOD requests
   - Approve a request (should become APPROVED)
   - Decline a request with reason

### Required API Documentation

Please provide:
1. **Swagger/OpenAPI Specification** - Interactive API documentation
2. **Postman Collection** - Ready-to-use API test suite
3. **API Base URL** - Development server endpoint
4. **WebSocket Support** (Optional) - For real-time updates

---

## 🚀 Deployment Considerations

### Environment Variables
Backend should support:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/attendance_db
SECRET_KEY=your-secret-key-for-jwt
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,https://your-production-domain.com
DEBUG=True  # False in production
```

### Database Migrations
- Ensure migrations include indexes on frequently queried fields
- Add foreign key constraints for data integrity
- Consider partitioning for `AttendanceRequest` table if data grows large

### Security Checklist
- ✅ Password hashing with bcrypt (min 10 rounds)
- ✅ JWT token signing with strong secret
- ✅ HTTPS in production
- ✅ SQL injection prevention (use ORM parameterized queries)
- ✅ XSS protection (sanitize user inputs)
- ✅ CSRF protection for state-changing operations
- ✅ Rate limiting on all endpoints
- ✅ Input validation on all endpoints

---

## 📞 Support & Questions

### Frontend Repository
- **GitHub**: [Physical-Attendance-Automation](https://github.com/dot-Dev-Club/Physical-Attendance-Automation)
- **Branch**: `feat-frontend`
- **Tech Stack**: React 19.2.0, TypeScript, Vite, Tailwind CSS

### Key Frontend Files
- `Frontend/types.ts` - TypeScript interfaces
- `Frontend/constants.ts` - Period mappings and mock data
- `Frontend/context/AuthContext.tsx` - Authentication logic
- `Frontend/context/AttendanceContext.tsx` - Request management
- `Frontend/components/login/LoginPage.tsx` - Login interface
- `Frontend/components/student/StudentDashboard.tsx` - Student view
- `Frontend/components/faculty/FacultyDashboard.tsx` - Faculty/HOD view

### Contact
For any clarifications, integration issues, or feature requests:
- Review this document first
- Check the frontend code for implementation details
- Contact the frontend development team

---

## 📋 Implementation Checklist

### Phase 1: Core Authentication
- [ ] User model with role field
- [ ] Faculty model with is_hod flag
- [ ] Login endpoint with isHOD in response
- [ ] JWT token generation and validation
- [ ] Role-based middleware/decorators

### Phase 2: Attendance Requests
- [ ] AttendanceRequest model with all fields
- [ ] Create request endpoint (single & multiple days)
- [ ] List requests endpoint with filters
- [ ] Get single request endpoint
- [ ] Delete request endpoint
- [ ] Status update endpoint with validation

### Phase 3: Faculty Management
- [ ] Faculty list endpoint
- [ ] Department-based filtering
- [ ] Include isHOD flag in responses

### Phase 4: Authorization & Security
- [ ] Permission checks for each endpoint
- [ ] Status transition validation
- [ ] Decline reason requirement
- [ ] Rate limiting
- [ ] CORS configuration

### Phase 5: Testing & Documentation
- [ ] Unit tests for all endpoints
- [ ] Integration tests for workflows
- [ ] Swagger/OpenAPI documentation
- [ ] Postman collection
- [ ] Sample data seeding script

### Phase 6: Production Ready
- [ ] Database indexes
- [ ] Error handling
- [ ] Logging
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deployment configuration

---

**Last Updated**: October 23, 2025  
**Frontend Version**: 1.0.0  
**Document Version**: 2.0.0
