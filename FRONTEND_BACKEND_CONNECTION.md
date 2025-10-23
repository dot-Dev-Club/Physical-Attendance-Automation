# Frontend-Backend Connection Guide

## ✅ Status: Backend API Integrated!

The frontend `api.ts` has been updated to connect with your Django backend.

## 🚀 How to Run Both Frontend and Backend

### Step 1: Start Backend (Terminal 1)

```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

### Step 2: Start Frontend (Terminal 2)

```powershell
cd Frontend
npm install  # First time only
npm run dev
```

Frontend will run at: `http://localhost:5173`

## 🔗 What Was Updated

### `Frontend/services/api.ts`
✅ All API functions now connect to Django backend
✅ Authentication (login, logout, getCurrentUser, refreshToken)
✅ Attendance requests (CRUD operations)
✅ Faculty endpoints
✅ Statistics endpoint
✅ Error handling
✅ JWT token management

### API Base URL
```typescript
const API_BASE_URL = 'http://localhost:8000/api'
```

## 📋 Test the Connection

### 1. Login Test

Open your browser console and try:

```javascript
// Test login
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'dickson@university.edu',
    password: 'student123',
    role: 'Student'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### 2. Frontend Login

1. Go to `http://localhost:5173`
2. Click "Student" or "Faculty" tab
3. Login with test credentials:
   - **Student:** dickson@university.edu / student123
   - **Faculty:** evelyn.reed@university.edu / faculty123
   - **HOD:** maria.chen@university.edu / faculty123

## 🎯 Available Test Accounts

### Students:
```
Email: dickson@university.edu     | Password: student123
Email: niranjan@university.edu    | Password: student123
Email: gokul@university.edu       | Password: student123
Email: earnest@university.edu     | Password: student123
```

### Faculty (Mentors):
```
Email: evelyn.reed@university.edu    | Password: faculty123 | isHOD: false
Email: sarah.williams@university.edu | Password: faculty123 | isHOD: false
```

### Faculty (HODs):
```
Email: maria.chen@university.edu     | Password: faculty123 | isHOD: true
Email: james.anderson@university.edu | Password: faculty123 | isHOD: true
```

## 🔍 Verify Connection

### Check Backend Logs

In your backend terminal, you should see requests like:
```
[23/Oct/2025 22:00:00] "POST /api/auth/login HTTP/1.1" 200
[23/Oct/2025 22:00:01] "GET /api/attendance/requests HTTP/1.1" 200
```

### Check Frontend Console

Open browser DevTools (F12) and check:
- Network tab for API calls
- Console for any errors
- Application → Session Storage for stored tokens

## 🐛 Troubleshooting

### CORS Error
```
Access to fetch at 'http://localhost:8000/api/...' has been blocked by CORS policy
```

**Solution:** Backend already configured for CORS. Check `.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 401 Unauthorized
**Solution:** Token expired or invalid. Logout and login again.

### Connection Refused
**Solution:** Make sure backend is running at `http://localhost:8000`

### 404 Not Found
**Solution:** Check API endpoint URL matches backend routes

## 📊 API Endpoints Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/refresh` | POST | Refresh token |
| `/api/attendance/requests` | GET | List requests |
| `/api/attendance/requests` | POST | Create request(s) |
| `/api/attendance/requests/:id` | GET | Get single request |
| `/api/attendance/requests/:id/status` | PATCH | Approve/decline |
| `/api/attendance/requests/:id` | DELETE | Delete request |
| `/api/faculty` | GET | List faculty |
| `/api/attendance/statistics` | GET | Get statistics |

## 🎉 Success Indicators

✅ Login redirects to dashboard
✅ Student sees their requests
✅ Faculty sees pending requests
✅ HOD sees HOD queue
✅ Statistics cards show real data
✅ Can create new requests
✅ Can approve/decline requests

## 🔐 How Authentication Works

1. User logs in → Backend returns JWT token
2. Token stored in `sessionStorage`
3. All API calls include: `Authorization: Bearer <token>`
4. Token expires after 1 hour
5. Refresh token valid for 7 days

## 📝 Next Steps

1. Test complete workflow:
   - Student creates request
   - Mentor approves (status → PENDING_HOD)
   - HOD approves (status → APPROVED)

2. Test all dashboards:
   - Student dashboard
   - Faculty (Mentor) dashboard
   - HOD dashboard

3. Verify data syncs:
   - Create request in frontend
   - Check in pgAdmin4
   - Check Django admin panel

---

**Everything is connected!** Your frontend now talks to the Django backend. 🚀
