# Bulk Attendance Request Feature - Complete Guide

## Overview
This guide describes the **Bulk Attendance Request** feature, which allows **students** to create attendance requests for multiple students at once (e.g., for team events, group activities, competitions). The multiple days feature has been removed to keep the system simple.

---

## What Changed?

### ❌ Removed: Multiple Days Feature
- Previously: Students could apply for attendance for multiple days at once
- Now: **Single day only** - one request = one date
- Why: Simplified workflow and easier approval process

### ✅ Added: Bulk Student Feature
- **Students** can now apply for **multiple students** in one request
- Perfect for: Team events, group competitions, hackathons, conferences
- The student who creates the request is the "creator" (they can be part of the bulk list too)
- Same approval flow: **Student → Mentor → HOD → Email notifications**

---

## How It Works

### Flow Diagram
```
Student Creates Request
    ↓
[Single Student]              [Bulk Students (Team)]
    ↓                              ↓
Mentor Reviews               Mentor Reviews
    ↓                              ↓
HOD Reviews                  HOD Reviews
    ↓                              ↓
Emails sent to               Emails sent to
period faculty               period faculty
(1 student)                  (multiple students)
```

### User Roles

#### **Students:**
- Can create **single** or **bulk** requests
- For bulk: Enter register numbers and names of all team members
- Follow same approval workflow
- Can only delete their own PENDING_MENTOR requests

#### **Mentors (Event Coordinators):**
- Review PENDING_MENTOR requests
- Can approve → PENDING_HOD or decline with reason
- See requests where they are the event coordinator

#### **HOD:**
- Review PENDING_HOD requests
- Final approval → APPROVED (triggers emails) or decline with reason
- Can see all department requests

---

## Database Schema

### Updated `AttendanceRequest` Model

```python
class AttendanceRequest(models.Model):
    # Student who created the request (even for bulk)
    student = models.ForeignKey(User, ...)  # Still required
    
    # NEW: Bulk request fields
    is_bulk_request = models.BooleanField(default=False)
    bulk_students = models.JSONField(default=list)  # Array of {registerNumber, name}
    created_by = models.ForeignKey(User, ...)  # Same as student
    
    # Existing fields
    date = models.DateField()
    periods = models.JSONField()
    period_faculty_mapping = models.JSONField()
    event_coordinator = models.CharField()
    event_coordinator_faculty = models.ForeignKey(User, ...)
    proof_faculty = models.CharField()
    purpose = models.TextField()
    status = models.CharField()  # PENDING_MENTOR, PENDING_HOD, APPROVED, DECLINED
    reason = models.TextField()  # Required when DECLINED
```

### Bulk Students JSON Format
```json
[
  {
    "registerNumber": "URK23AI1090",
    "name": "Gokul P"
  },
  {
    "registerNumber": "URK23AI1091",
    "name": "Niranjan T"
  },
  {
    "registerNumber": "URK23AI1092",
    "name": "Dickson E"
  }
]
```

---

## API Endpoints

### **POST /api/attendance/requests**

#### Single Student Request (Student for themselves)
```json
{
  "date": "2025-11-15",
  "periods": [1, 2, 3],
  "periodFacultyMapping": {
    "1": "faculty-uuid-1",
    "2": "faculty-uuid-2",
    "3": "faculty-uuid-3"
  },
  "eventCoordinator": "Dr. Smith",
  "eventCoordinatorFacultyId": "faculty-uuid-123",
  "proofFaculty": "Dr. Johnson",
  "purpose": "Attending AI workshop at university"
}
```

#### Bulk Request (Student applying for team)
```json
{
  "date": "2025-11-15",
  "periods": [1, 2, 3, 4],
  "periodFacultyMapping": {
    "1": "faculty-uuid-1",
    "2": "faculty-uuid-2",
    "3": "faculty-uuid-3",
    "4": "faculty-uuid-4"
  },
  "eventCoordinator": "Dr. Smith",
  "eventCoordinatorFacultyId": "faculty-uuid-123",
  "proofFaculty": "Dr. Johnson",
  "purpose": "Our team is participating in National Level Hackathon organized by IIT Madras",
  "bulkStudents": [
    {
      "registerNumber": "URK23AI1090",
      "name": "Gokul P"
    },
    {
      "registerNumber": "URK23AI1091",
      "name": "Niranjan T"
    },
    {
      "registerNumber": "URK23AI1092",
      "name": "Dickson E"
    },
    {
      "registerNumber": "URK23AI1093",
      "name": "Earnest K"
    }
  ]
}
```

#### Response (Single)
```json
{
  "id": "request-uuid",
  "studentId": "student-uuid",
  "studentName": "Gokul P",
  "studentEmail": "gokulp@karunya.edu.in",
  "isBulkRequest": false,
  "bulkStudents": [],
  "createdBy": "student-uuid",
  "createdByName": "Gokul P",
  "date": "2025-11-15",
  "periods": [1, 2, 3],
  "periodFacultyMapping": {...},
  "eventCoordinator": "Dr. Smith",
  "eventCoordinatorFacultyId": "faculty-uuid-123",
  "eventCoordinatorFacultyName": "Dr. Smith",
  "proofFaculty": "Dr. Johnson",
  "purpose": "Attending AI workshop",
  "status": "PENDING_MENTOR",
  "reason": null,
  "proofUrl": null,
  "createdAt": "2025-11-08T10:30:00Z",
  "updatedAt": "2025-11-08T10:30:00Z"
}
```

#### Response (Bulk)
```json
{
  "id": "request-uuid",
  "studentId": "student-uuid",
  "studentName": "Gokul P",
  "studentEmail": "gokulp@karunya.edu.in",
  "isBulkRequest": true,
  "bulkStudents": [
    {"registerNumber": "URK23AI1090", "name": "Gokul P"},
    {"registerNumber": "URK23AI1091", "name": "Niranjan T"},
    {"registerNumber": "URK23AI1092", "name": "Dickson E"}
  ],
  "createdBy": "student-uuid",
  "createdByName": "Gokul P",
  "date": "2025-11-15",
  "periods": [1, 2, 3, 4],
  "periodFacultyMapping": {...},
  "eventCoordinator": "Dr. Smith",
  "eventCoordinatorFacultyId": "faculty-uuid-123",
  "eventCoordinatorFacultyName": "Dr. Smith",
  "proofFaculty": "Dr. Johnson",
  "purpose": "Team participating in hackathon",
  "status": "PENDING_MENTOR",
  "reason": null,
  "proofUrl": null,
  "createdAt": "2025-11-08T10:30:00Z",
  "updatedAt": "2025-11-08T10:30:00Z"
}
```

### **PATCH /api/attendance/requests/:id/status**

Same for both single and bulk requests.

#### Mentor Approval
```json
{
  "status": "PENDING_HOD"
}
```

#### Mentor Decline
```json
{
  "status": "DECLINED",
  "reason": "Event date conflicts with exam schedule"
}
```

#### HOD Approval
```json
{
  "status": "APPROVED"
}
```

When HOD approves, **emails are automatically sent** to all period faculty members.

---

## Email Notifications

### Single Student Approval Email
```
Subject: Physical Attendance Approved - Gokul P - 15-11-2025
To: faculty@university.edu

Dear [Faculty Name],

This is to inform you that a physical attendance request has been approved:

STUDENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:          Gokul P
Email:         gokulp@karunya.edu.in
Date:          November 15, 2025 (Friday)
Your Period(s): Period 1, Period 2

EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:            Attending AI workshop
Event Coordinator:  Dr. Smith

The student has been granted physical attendance. Please mark attendance accordingly.

Best regards,
[HOD Name]
[HOD Title]
```

### Bulk Student Approval Email
```
Subject: Physical Attendance Approved - 4 Students - 15-11-2025
To: faculty@university.edu

Dear [Faculty Name],

This is to inform you that a physical attendance request has been approved:

STUDENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bulk Request (4 students):
  - URK23AI1090: Gokul P
  - URK23AI1091: Niranjan T
  - URK23AI1092: Dickson E
  - URK23AI1093: Earnest K

Date:          November 15, 2025 (Friday)
Your Period(s): Period 1, Period 2, Period 3

EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:            Team participating in National Hackathon
Event Coordinator:  Dr. Smith

The students have been granted physical attendance. Please mark attendance accordingly.

Best regards,
[HOD Name]
[HOD Title]
```

**Note:** Emails are sent from the HOD's email address configured in `.env` (dotdev.atom@gmail.com)

---

## Frontend Implementation

### Student Dashboard - Add Bulk Option

```typescript
// types.ts
interface BulkStudent {
  registerNumber: string;
  name: string;
}

interface AttendanceRequestData {
  date: string;
  periods: number[];
  periodFacultyMapping: Record<string, string>;
  eventCoordinator: string;
  eventCoordinatorFacultyId: string;
  proofFaculty: string;
  purpose: string;
  bulkStudents?: BulkStudent[];  // Optional - for bulk requests
}
```

### Bulk Request Form Component

```tsx
import React, { useState } from 'react';

const NewRequestForm = () => {
  const [isBulk, setIsBulk] = useState(false);
  const [bulkStudents, setBulkStudents] = useState<BulkStudent[]>([]);
  const [registerNumber, setRegisterNumber] = useState('');
  const [studentName, setStudentName] = useState('');

  // Add student to bulk list
  const handleAddStudent = () => {
    if (registerNumber.trim() && studentName.trim()) {
      setBulkStudents([
        ...bulkStudents,
        { registerNumber: registerNumber.trim(), name: studentName.trim() }
      ]);
      setRegisterNumber('');
      setStudentName('');
    }
  };

  // Remove student from bulk list
  const handleRemoveStudent = (index: number) => {
    setBulkStudents(bulkStudents.filter((_, i) => i !== index));
  };

  // Parse bulk input (textarea with format: "URK23AI1090, Gokul P" per line)
  const handleBulkPaste = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const students = lines.map(line => {
      const [regNo, ...nameParts] = line.split(',').map(p => p.trim());
      return {
        registerNumber: regNo || '',
        name: nameParts.join(' ') || ''
      };
    }).filter(s => s.registerNumber && s.name);
    
    setBulkStudents([...bulkStudents, ...students]);
  };

  return (
    <div className="request-form">
      <h2>New Attendance Request</h2>
      
      {/* Toggle: Single vs Bulk */}
      <div className="toggle-group">
        <label>
          <input
            type="radio"
            checked={!isBulk}
            onChange={() => setIsBulk(false)}
          />
          Single (For myself only)
        </label>
        <label>
          <input
            type="radio"
            checked={isBulk}
            onChange={() => setIsBulk(true)}
          />
          Bulk (For team/group)
        </label>
      </div>

      {/* Bulk Students Input */}
      {isBulk && (
        <div className="bulk-input">
          <h3>Team Members ({bulkStudents.length})</h3>
          
          {/* Option 1: Add one by one */}
          <div className="add-student">
            <input
              placeholder="Register Number (e.g., URK23AI1090)"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
            />
            <input
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
            <button onClick={handleAddStudent}>Add Student</button>
          </div>

          {/* Option 2: Bulk paste */}
          <div className="bulk-paste">
            <p>Or paste multiple (one per line: "RegNo, Name"):</p>
            <textarea
              placeholder="URK23AI1090, Gokul P&#10;URK23AI1091, Niranjan T"
              rows={5}
              onPaste={(e) => {
                e.preventDefault();
                handleBulkPaste(e.clipboardData.getData('text'));
              }}
            />
          </div>

          {/* Display added students */}
          <div className="student-list">
            {bulkStudents.map((student, index) => (
              <div key={index} className="student-item">
                <span>{student.registerNumber} - {student.name}</span>
                <button onClick={() => handleRemoveStudent(index)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common fields: Date, Periods, Faculty, Purpose */}
      {/* ... rest of the form ... */}
    </div>
  );
};
```

### API Call

```typescript
const createAttendanceRequest = async (data: AttendanceRequestData) => {
  const response = await fetch('/api/attendance/requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create request');
  }

  return response.json();
};
```

### Display Request Card

```tsx
const RequestCard = ({ request }: { request: AttendanceRequest }) => {
  return (
    <div className="request-card">
      {/* Student who created */}
      <div className="creator-info">
        <p>Created by: {request.studentName}</p>
      </div>

      {/* Student details */}
      {request.isBulkRequest ? (
        <div className="bulk-details">
          <h3>📋 Bulk Request ({request.bulkStudents.length} students)</h3>
          <div className="student-list">
            {request.bulkStudents.map((student, idx) => (
              <div key={idx} className="student-item">
                {student.registerNumber}: {student.name}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="single-details">
          <h3>👤 {request.studentName}</h3>
          <p>{request.studentEmail}</p>
        </div>
      )}

      {/* Request details */}
      <div className="request-details">
        <p><strong>Date:</strong> {new Date(request.date).toLocaleDateString()}</p>
        <p><strong>Periods:</strong> {request.periods.join(', ')}</p>
        <p><strong>Purpose:</strong> {request.purpose}</p>
        <p><strong>Event Coordinator:</strong> {request.eventCoordinator}</p>
        <p><strong>Status:</strong> <span className={`status ${request.status}`}>{request.status}</span></p>
        {request.reason && <p><strong>Reason:</strong> {request.reason}</p>}
      </div>

      {/* Actions (approve/decline buttons for faculty) */}
    </div>
  );
};
```

---

## Migration Steps

### 1. Create Migration
```bash
cd /root/Physical-Attendance-Automation/Backend
source venv/bin/activate
python manage.py makemigrations
```

### 2. Apply Migration
```bash
python manage.py migrate
```

### 3. Verify Migration
The migration adds these new fields:
- `is_bulk_request` (BooleanField, default: False)
- `bulk_students` (JSONField, default: [])
- `created_by` (ForeignKey to User, nullable)

### 4. Update .env Email Settings
Ensure your `.env` has the correct HOD email configured:
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=dotdev.atom@gmail.com
EMAIL_HOST_PASSWORD=your_app_password_here
DEFAULT_FROM_EMAIL=dotdev.atom@gmail.com
```

### 5. Test Bulk Request
```bash
python manage.py shell
```

```python
from attendance.models import User, AttendanceRequest

# Get a student
student = User.objects.filter(role='Student').first()

# Create bulk request
bulk_req = AttendanceRequest.objects.create(
    student=student,
    is_bulk_request=True,
    bulk_students=[
        {'registerNumber': 'URK23AI1090', 'name': 'Gokul P'},
        {'registerNumber': 'URK23AI1091', 'name': 'Niranjan T'},
        {'registerNumber': 'URK23AI1092', 'name': 'Dickson E'}
    ],
    created_by=student,
    date='2025-11-15',
    periods=[1, 2, 3],
    event_coordinator='Dr. Smith',
    proof_faculty='Dr. Johnson',
    purpose='Team participating in hackathon organized by Tech University',
    status='PENDING_MENTOR'
)

print(f"✓ Created bulk request: {bulk_req.id}")
print(f"  - Created by: {bulk_req.student.email}")
print(f"  - Students: {len(bulk_req.bulk_students)}")
print(f"  - Status: {bulk_req.status}")
```

---

## Testing Checklist

### Backend:
- [x] Students can create single requests for themselves
- [x] Students can create bulk requests for teams
- [x] Bulk requests require registerNumber and name for each student
- [x] Same approval workflow for both single and bulk
- [x] Email notifications include all bulk students
- [x] Only students can create requests (not faculty)
- [x] Student who creates bulk request is tracked

### Frontend:
- [ ] Add toggle for Single vs Bulk request
- [ ] Bulk input form (manual entry + paste)
- [ ] Display bulk student list with remove option
- [ ] Show bulk requests differently in dashboards
- [ ] Mentor/HOD can approve/decline bulk requests
- [ ] Email verification for bulk approvals

---

## Summary

### ✅ What's New:
1. **Bulk requests** - Students can apply for multiple students (team/group)
2. **Single day only** - Removed multiple days feature
3. **Same workflow** - Student → Mentor → HOD → Email
4. **Student-driven** - Students create all requests (single or bulk)

### ❌ What's Removed:
1. Multiple days feature
2. Faculty creating requests for students

### 🔄 What's Same:
1. Approval workflow (Mentor → HOD)
2. Email notifications to period faculty
3. Status tracking (PENDING_MENTOR, PENDING_HOD, APPROVED, DECLINED)
4. Period faculty mapping

---

## Support

For questions or issues, contact the development team.

**Last Updated:** November 8, 2025  
**Version:** 2.0 - Bulk Support Added
