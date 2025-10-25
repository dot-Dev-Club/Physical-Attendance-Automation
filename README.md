# Physical Attendance Automation System

A modern web application for managing student physical attendance requests in educational institutions with a two-tier faculty approval workflow.

## 🎯 Overview

This system allows students to request attendance approval for participating in physical events/activities during class hours. Requests go through a two-stage approval process:
1. **Mentor Approval** - First level review
2. **HOD Approval** - Final approval

## 📁 Project Structure

```
Physical-Attendance-Automation/
├── Backend/              # Django REST API (in development)
│   └── main.py
├── Frontend/             # React + TypeScript
│   ├── components/       # React components
│   │   ├── faculty/      # Faculty dashboard
│   │   ├── student/      # Student dashboard
│   │   ├── login/        # Authentication
│   │   ├── shared/       # Shared components
│   │   └── ui/           # UI component library
│   ├── context/          # React Context providers
│   └── types.ts          # TypeScript definitions
└── README.md
```

## 🚀 Frontend Setup

### Prerequisites
- Node.js (v18+)
- npm

### Installation

```bash
cd Frontend
npm install
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🔧 Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Context API** - State management

### Backend (In Development)
- **Django** - Python web framework
- **PostgreSQL** - Database

## 📝 Features

### For Students
- ✍️ Submit attendance requests with:
  - Event date
  - Number of periods (1-8)
  - Event coordinator
  - Faculty to send proof
  - Purpose description
- 📊 View request history
- 🎨 Track request status with color-coded badges

### For Faculty
- 👨‍🏫 Two-tier approval queues (Mentor/HOD)
- ✅ Approve or decline requests
- 📝 Add decline reasons
- 📊 View complete request history
- 🔢 Real-time pending request counts

## 🗄️ Data Storage

**Current Implementation:**
- Uses `sessionStorage` for temporary data caching
- Data persists during the browser session only
- Automatically cleared when browser is closed
- No permanent storage (ready for backend integration)

**Note:** This is a temporary solution. Once the Django backend is ready, all data will be persisted in PostgreSQL database.

## 🔐 Authentication

**Current Implementation:**
- Demo login system (for development)
- Role-based access (Student/Faculty)
- Session-based auth state

**Planned:**
- JWT-based authentication with Django backend
- Real user credentials
- Role-based permissions

## 🎨 UI Components

Custom reusable component library:
- **Button** - 5 variants (primary, secondary, success, danger, ghost)
- **Card** - Container with Header, Content, Footer
- **Badge** - Status indicators
- **Input** - Form inputs
- **Select** - Dropdowns
- **Modal** - Popup dialogs
- **AttendanceTable** - Data table with actions

## 🌙 Theme Support

- Light and dark mode
- Automatic theme switching
- Consistent styling across themes

## 📦 Project Status

### ✅ Completed
- Frontend UI/UX design
- Component architecture
- Session-based temporary storage
- Role-based dashboards
- Request submission workflow
- Approval workflow
- Empty state handling

### 🚧 In Development
- Django REST API backend
- PostgreSQL database integration
- Real authentication system
- API service layer
- File upload for proofs

### 📋 Planned
- Form validation (React Hook Form + Zod)
- Toast notifications
- Search and filtering
- Pagination
- Request editing
- Email notifications
- Analytics dashboard
- Testing suite

## 🤝 Team

- **Frontend Development** - Current developer
- **Backend Development** - Django + PostgreSQL team member
