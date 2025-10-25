# Physical Attendance Automation System

A modern full-stack web application for managing student physical attendance requests in educational institutions with a two-tier faculty approval workflow and automated email notifications.

## 🎯 Overview

This system streamlines the process of managing student attendance for physical events/activities during class hours. Students can submit requests that go through a comprehensive two-stage approval process:
1. **Mentor Approval** - First level review by assigned faculty mentor
2. **HOD Approval** - Final approval by Head of Department

Upon HOD approval, automated email notifications are sent to all relevant faculty members for seamless attendance tracking.

## 📁 Project Structure

```
Physical-Attendance-Automation/
├── Backend/                    # Django REST API
│   ├── attendance/             # Main app
│   │   ├── models.py          # Database models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # API endpoints
│   │   ├── permissions.py     # Custom permissions
│   │   └── urls.py            # URL routing
│   ├── config/                # Django settings
│   ├── manage.py              # Django CLI
│   ├── .env                   # Environment variables
│   ├── requirements.txt       # Python dependencies
│   └── EMAIL_SETUP_GUIDE.md  # Email configuration guide
├── Frontend/                   # React + TypeScript
│   ├── components/            # React components
│   │   ├── faculty/           # Faculty dashboard & views
│   │   ├── student/           # Student dashboard & forms
│   │   ├── login/             # Authentication pages
│   │   ├── shared/            # Shared components
│   │   └── ui/                # UI component library
│   ├── context/               # React Context providers
│   ├── services/              # API integration
│   ├── types.ts               # TypeScript definitions
│   └── .env                   # Frontend config
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **PostgreSQL** (v14+)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to Backend directory:**
```bash
cd Backend
```

2. **Create virtual environment:**
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows
# or
source .venv/bin/activate    # Linux/Mac
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update database credentials
   - Configure email settings (see `EMAIL_SETUP_GUIDE.md`)

5. **Run migrations:**
```bash
python manage.py migrate
```

6. **Create superuser (optional):**
```bash
python manage.py createsuperuser
```

7. **Start development server:**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to Frontend directory:**
```bash
cd Frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
   - Update `.env` with backend API URL:
   ```env
   VITE_API_URL=YOUR_VITE_API_URL
   ```

4. **Start development server:**
```bash
npm run dev
```

### Production Build

```bash
# Frontend
npm run build

# Backend
python manage.py collectstatic
```

## 🔧 Tech Stack

### Frontend
- **React 19.2.0** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite 6.4.1** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API calls
- **React Context API** - State management
- **Lucide React** - Beautiful icons

### Backend
- **Django 4.2.25** - Robust Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Relational database
- **psycopg2** - PostgreSQL adapter
- **djangorestframework-simplejwt** - JWT authentication
- **django-cors-headers** - CORS middleware
- **python-dotenv** - Environment management

## 📝 Features

### For Students
- ✍️ **Submit Attendance Requests** with:
  - Single day or multiple days
  - Specific period selection (1-8)
  - Period-specific faculty assignment
  - Event coordinator details
  - Event purpose/description (10-500 characters)
- 📊 **View Request History** with status tracking
- 🎨 **Color-coded Status Badges**:
  - 🟡 Pending (Mentor)
  - 🔵 Mentor Approved
  - 🟢 Approved
  - 🔴 Declined
- 📱 **Real-time Updates** on request status

### For Faculty (Mentor)
- 👀 **Review Student Requests** in mentor queue
- ✅ **Approve/Decline** with optional comments
- 📊 **Dashboard Statistics**:
  - Total requests
  - Pending mentor approvals
  - Approved count
  - Declined count
- 📝 **Complete Request History** with filters
- 🔔 **Real-time Notification Counts**

### For Faculty (HOD)
- 🎯 **Final Approval Authority** for mentor-approved requests
- 📧 **Automated Email Notifications**:
  - Sent from HOD's email
  - To all period faculty members
  - Includes student details, periods, and event info
- 📊 **Comprehensive Dashboard** with:
  - Mentor approved queue
  - Approved/declined statistics
  - Historical data view
- 🔍 **Advanced Filtering** and search

### Email Notification System
- 📬 **Automatic Email Dispatch** when HOD approves
- 👤 **Personalized Emails** for each faculty
- 📋 **Detailed Information**:
  - Student name and email
  - Event date and periods
  - Event purpose
  - Coordinator details
- 🔐 **Secure SMTP** configuration
- ✅ **Professional Email Templates**

## 🗄️ Database Schema

### Core Models
- **User** - Base authentication (email-based)
- **Student** - Student profile with mentor assignment
- **Faculty** - Faculty profile with role (Mentor/HOD)
- **AttendanceRequest** - Request details with:
  - Date range support
  - Period-faculty mapping (JSONB)
  - Event coordinator
  - Multi-stage approval workflow

### Relationships
```
User (1) ←→ (1) Student/Faculty
Student (N) → (1) Faculty (mentor)
Student (1) → (N) AttendanceRequest
Faculty (1) → (N) AttendanceRequest (event coordinator)
```

## 🔐 Authentication & Permissions

- **JWT-based Authentication**
  - Access & Refresh tokens
  - Secure token refresh mechanism
  - Role-based permissions

- **Role-Based Access Control**
  - Student: Create and view own requests
  - Faculty (Mentor): Approve mentor-stage requests
  - Faculty (HOD): Final approval and email dispatch

- **Custom Permissions**
  - `IsStudent` - Student-only actions
  - `IsFaculty` - Faculty-only actions
  - `IsHOD` - HOD-only actions
  - `IsStudentOwner` - Own request management

## 📧 Email Configuration

### Development Mode (Console Backend)
Emails print to terminal for testing:
```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Production Mode (SMTP)
Configure Gmail App Password:
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=hod-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

See EMAIL_SETUP_GUIDE.md for detailed setup instructions.

## 🎨 UI Components Library

Custom reusable components built with React + TypeScript:

- **Button** - 5 variants (primary, secondary, success, danger, ghost)
- **Card** - Container with Header, Content, Footer sections
- **Badge** - Status indicators with color variants
- **Input** - Form inputs with validation states
- **Select** - Dropdowns with search
- **Modal** - Popup dialogs with animations
- **AttendanceTable** - Data table with sorting and actions
- **EmptyState** - Placeholder for no data scenarios

All components support:
- 🌙 Dark/Light theme
- ♿ Accessibility (ARIA labels)
- 📱 Responsive design
- 🎯 TypeScript type safety

## 🌙 Theme Support

- **Automatic Theme Detection** based on system preferences
- **Manual Toggle** between light and dark modes
- **Persistent Theme** across sessions
- **Consistent Styling** with Tailwind CSS

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Refresh access token

### Attendance Requests
- `GET /api/attendance/requests/` - List requests
- `POST /api/attendance/requests/` - Create request
- `GET /api/attendance/requests/{id}/` - Get request details
- `PATCH /api/attendance/requests/{id}/status/` - Update status

### Faculty
- `GET /api/faculty/` - List faculty members

### Statistics
- `GET /api/attendance/statistics/` - Dashboard statistics

## 🤝 Team & Contributions

### Team Members
- **Earnest Kirubakaran Oswarld S** - Backend Development & Integration
  - Django REST API architecture
  - Database design & migrations
  - Email notification system
  - Backend-Frontend integration
  - Deployment & DevOps

- **Dickson E** - Frontend Development
  - React component library
  - UI/UX design implementation
  - TypeScript type definitions
  - State management

- **Niranjan T** - Backend Development
  - Database optimization
  - Business logic implementation
  - Testing & debugging
  - Documentation

- **Gokul P** - Frontend Development & Integration
  - API service layer
  - Authentication flow
  - Frontend-Backend integration
  - Responsive design

- **Aries Nathya A** - Backend Development
  - Django models & serializers
  - Authentication system
  - Permission framework
  - API endpoints

## 📄 License

This project is developed for educational purposes as part of university dot dev club

## 🐛 Bug Reports & Feature Requests

Please report issues or request features through the project's issue tracker.

---
