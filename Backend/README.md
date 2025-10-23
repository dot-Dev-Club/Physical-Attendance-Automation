# Physical Attendance Automation - Backend

Production-ready Django REST API for the Physical Attendance Automation System with PostgreSQL database integration.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication with role verification
- **Role-Based Access Control** - Student, Faculty (Mentor), and HOD roles with specific permissions
- **Two-Tier Approval Workflow** - Student → Mentor → HOD approval chain
- **PostgreSQL Database** - Production-ready database with proper indexing
- **RESTful API** - Complete API following REST principles
- **Environment-Based Configuration** - Easy deployment with environment variables
- **CORS Support** - Configured for frontend integration
- **Admin Panel** - Django admin for easy data management

## 📋 Prerequisites

- Python 3.10 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dot-Dev-Club/Physical-Attendance-Automation.git
cd Physical-Attendance-Automation/Backend
```

### 2. Create Virtual Environment

```powershell
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Database Setup (PostgreSQL)

**Create PostgreSQL Database:**

Using pgAdmin4 or psql command line:

```sql
CREATE DATABASE attendance_db;
CREATE USER postgres WITH PASSWORD 'your_password';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO postgres;
```

### 5. Environment Configuration

**Create `.env` file from example:**

```powershell
cp .env.example .env
```

**Edit `.env` file with your configuration:**

```env
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL Database Configuration
POSTGRES_DB=attendance_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_actual_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# CORS Configuration (Frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Email Configuration (optional - for HOD notifications)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@university.edu
```

### 6. Run Migrations

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Admin)

```powershell
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 8. Run Development Server

```powershell
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`

## 📚 API Documentation

### Base URL
- Development: `http://localhost:8000/api/`
- All endpoints return JSON responses
- Protected endpoints require `Authorization: Bearer <token>` header

### Quick Reference

**Authentication:**
- `POST /api/auth/login` - Login with email, password, and role
- `POST /api/auth/logout` - Logout and invalidate token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

**Attendance Requests:**
- `GET /api/attendance/requests` - List requests (with filters)
- `GET /api/attendance/requests/:id` - Get single request
- `POST /api/attendance/requests` - Create request(s)
- `PATCH /api/attendance/requests/:id/status` - Update status
- `DELETE /api/attendance/requests/:id` - Delete request

**Faculty:**
- `GET /api/faculty` - List all faculty members
- `GET /api/faculty/by-department/:department` - Faculty by department

**Statistics:**
- `GET /api/attendance/statistics` - Role-specific statistics

For complete API documentation, see: `Frontend/BACKEND_INTEGRATION.md`

## 🧪 Testing with Sample Data

### Create Test Users

```powershell
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from attendance.models import Faculty, Student

User = get_user_model()

# Create Student
student = User.objects.create_user(
    username='dickson',
    email='dickson@university.edu',
    password='student123',
    first_name='Dickson',
    last_name='Student',
    role='Student'
)

# Create Faculty (Mentor)
faculty_user = User.objects.create_user(
    username='evelyn.reed',
    email='evelyn.reed@university.edu',
    password='faculty123',
    first_name='Evelyn',
    last_name='Reed',
    role='Faculty'
)

Faculty.objects.create(
    user=faculty_user,
    title='Professor, Computer Science',
    department='Computer Science',
    is_hod=False
)

# Create HOD
hod_user = User.objects.create_user(
    username='maria.chen',
    email='maria.chen@university.edu',
    password='faculty123',
    first_name='Maria',
    last_name='Chen',
    role='Faculty'
)

Faculty.objects.create(
    user=hod_user,
    title='Professor, Computer Science (HOD)',
    department='Computer Science',
    is_hod=True
)
```

## 🔐 Security Considerations

### Production Checklist

- [ ] Change `DJANGO_SECRET_KEY` to a strong random string
- [ ] Set `DJANGO_DEBUG=False` in production
- [ ] Update `DJANGO_ALLOWED_HOSTS` with your domain
- [ ] Use strong PostgreSQL password
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting (optional)
- [ ] Regular database backups
- [ ] Monitor logs for security issues

## 🚀 Production Deployment

### Using Gunicorn

```powershell
# Install gunicorn (already in requirements.txt)
pip install gunicorn

# Run with gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Environment Variables

For production, set these environment variables on your hosting platform:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS=yourdomain.com`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `CORS_ALLOWED_ORIGINS=https://yourdomain.com`

## 📁 Project Structure

```
Backend/
├── config/                 # Django project configuration
│   ├── __init__.py
│   ├── asgi.py            # ASGI config
│   ├── settings.py        # Main settings
│   ├── urls.py            # Root URL routing
│   └── wsgi.py            # WSGI config
├── attendance/            # Main app
│   ├── migrations/        # Database migrations
│   ├── __init__.py
│   ├── admin.py          # Admin panel config
│   ├── apps.py           # App configuration
│   ├── exceptions.py     # Custom error handlers
│   ├── models.py         # Database models
│   ├── permissions.py    # Custom permissions
│   ├── serializers.py    # DRF serializers
│   ├── urls.py           # App URL routing
│   └── views.py          # API views
├── manage.py             # Django management script
├── requirements.txt      # Python dependencies
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🗄️ Database Models

### User (Custom)
- UUID primary key
- Email authentication
- Roles: Student, Faculty
- JWT token support

### Faculty
- User profile for Faculty role
- Title, Department
- **`is_hod` flag** - Critical for dashboard access

### Student (Optional)
- User profile for Student role
- Student ID, Department, Year, Section
- Mentor assignment

### AttendanceRequest
- UUID primary key
- Date, Periods (JSON array)
- Event Coordinator, Proof Faculty
- Purpose, Status, Reason
- **Status choices:** PENDING_MENTOR, PENDING_HOD, APPROVED, DECLINED

## 🔄 Workflow

```
Student submits request
        ↓
[PENDING_MENTOR] ← Mentor approves/declines
        ↓
[PENDING_HOD]    ← HOD approves/declines
        ↓
[APPROVED]       ← Final status
```

## 🐛 Troubleshooting

### Database Connection Error
```
django.db.utils.OperationalError: could not connect to server
```
**Solution:** Ensure PostgreSQL is running and credentials in `.env` are correct.

### Import Errors
```
ImportError: No module named 'rest_framework'
```
**Solution:** Activate virtual environment and run `pip install -r requirements.txt`

### Migration Issues
```
django.db.migrations.exceptions.InconsistentMigrationHistory
```
**Solution:** Delete migration files (except `__init__.py`) and database, then run migrations again.

### CORS Errors in Frontend
```
Access to fetch at 'http://localhost:8000/api/...' has been blocked by CORS policy
```
**Solution:** Check `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend URL.

## 📞 Support

- **Frontend Documentation:** `Frontend/BACKEND_INTEGRATION.md`
- **GitHub Repository:** [Physical-Attendance-Automation](https://github.com/dot-Dev-Club/Physical-Attendance-Automation)
- **Branch:** `feat-frontend`

## 📄 License

This project is part of the Physical Attendance Automation System.

---

**Last Updated:** October 23, 2025  
**Django Version:** 4.2+  
**Python Version:** 3.10+  
**Database:** PostgreSQL 12+
