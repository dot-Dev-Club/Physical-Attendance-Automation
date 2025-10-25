"""
Seed script for Physical Attendance Automation System
Populates database with real Karunya University users and sample data
Matches database_setup.sql structure
"""

import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from attendance.models import User, Faculty, Student, AttendanceRequest
from django.contrib.auth.hashers import make_password

def clear_database():
    """Clear existing data"""
    print("🗑️  Clearing existing data...")
    try:
        AttendanceRequest.objects.all().delete()
        Student.objects.all().delete()
        Faculty.objects.all().delete()
        User.objects.all().delete()
        print("✅ Database cleared\n")
    except Exception as e:
        print(f"⚠️  Warning during clear: {e}")
        print("Continuing with seed...\n")

def create_students():
    """Create student users and profiles"""
    print("👨‍🎓 Creating students...")
    
    students_data = [
        {
            'username': 'urk23ai1090',
            'email': 'gokulp@karunya.edu.in',
            'password': 'student123',
            'first_name': 'Gokul',
            'last_name': 'P',
            'student_id': 'urk23ai1090',
        },
        {
            'username': 'urk23ai1103',
            'email': 'niranjant@karunya.edu.in',
            'password': 'student123',
            'first_name': 'Niranjan',
            'last_name': 'T',
            'student_id': 'urk23ai1103',
        },
        {
            'username': 'urk23ai1072',
            'email': 'dicksone@karunya.edu.in',
            'password': 'student123',
            'first_name': 'Dickson',
            'last_name': 'E',
            'student_id': 'urk23ai1072',
        },
        {
            'username': 'urk23ai1046',
            'email': 'earnestkirubakaran@karunya.edu.in',
            'password': 'student123',
            'first_name': 'Earnest',
            'last_name': 'Kirubakaran',
            'student_id': 'urk23ai1046',
        },
        {
            'username': 'urk23ai1082',
            'email': 'ariesnathya@karunya.edu.in',
            'password': 'student123',
            'first_name': 'Aries',
            'last_name': 'Nathya',
            'student_id': 'urk23ai1082',
        },
    ]
    
    for student_data in students_data:
        # Create user
        user = User.objects.create(
            username=student_data['username'],
            email=student_data['email'],
            password=make_password(student_data['password']),
            first_name=student_data['first_name'],
            last_name=student_data['last_name'],
            role='Student',
            is_active=True,
            is_staff=False,
            is_superuser=False
        )
        
        # Create student profile
        Student.objects.create(
            user=user,
            student_id=student_data['student_id'],
            department='Computer Science',
            year=3,
            section='A'
        )
        
        print(f"  ✓ Created: {user.name} ({user.email})")
    
    print(f"✅ Created {len(students_data)} students\n")

def create_faculty():
    """Create faculty users and profiles"""
    print("👨‍🏫 Creating faculty...")
    
    faculty_data = [
        {
            'username': 'grace.mary',
            'email': 'dotdev.test@gmail.com',
            'password': 'faculty123',
            'first_name': 'Grace Mary',
            'last_name': 'Kanaga',
            'title': 'Professor, Computer Science (HOD)',
            'is_hod': True,
        },
        {
            'username': 'antony.taurshia',
            'email': 'dicksone2006@gmail.com',
            'password': 'faculty123',
            'first_name': 'Antony',
            'last_name': 'Taurshia',
            'title': 'Assistant Professor, Computer Science',
            'is_hod': False,
        },
        {
            'username': 'nirmal',
            'email': 'niranjan2005official@gmail.com',
            'password': 'faculty123',
            'first_name': 'Nirmal',
            'last_name': '',
            'title': 'Assistant Professor, Computer Science',
            'is_hod': False,
        },
        {
            'username': 'ebenezer',
            'email': 'earni8105@gmail.com',
            'password': 'faculty123',
            'first_name': 'Ebenezer',
            'last_name': '',
            'title': 'Assistant Professor, Computer Science',
            'is_hod': False,
        },
        {
            'username': 'jenefa',
            'email': 'ariesnathya@gmail.com',
            'password': 'faculty123',
            'first_name': 'Jenefa',
            'last_name': '',
            'title': 'Assistant Professor, Computer Science',
            'is_hod': False,
        },
        {
            'username': 'sirija',
            'email': 'gokulp1806official@gmail.com',
            'password': 'faculty123',
            'first_name': 'Sirija',
            'last_name': '',
            'title': 'Assistant Professor, Computer Science',
            'is_hod': False,
        },
    ]
    
    for faculty_info in faculty_data:
        # Create user
        user = User.objects.create(
            username=faculty_info['username'],
            email=faculty_info['email'],
            password=make_password(faculty_info['password']),
            first_name=faculty_info['first_name'],
            last_name=faculty_info['last_name'],
            role='Faculty',
            is_active=True,
            is_staff=False,
            is_superuser=False
        )
        
        # Create faculty profile
        Faculty.objects.create(
            user=user,
            title=faculty_info['title'],
            department='Computer Science',
            is_hod=faculty_info['is_hod']
        )
        
        hod_label = " (HOD)" if faculty_info['is_hod'] else ""
        print(f"  ✓ Created: {user.name}{hod_label} ({user.email})")
    
    print(f"✅ Created {len(faculty_data)} faculty\n")
    return faculty_data

def create_attendance_requests():
    """Create sample attendance requests"""
    print("📝 Creating attendance requests...")
    
    # Get users
    dickson = User.objects.get(email='dicksone@karunya.edu.in')
    niranjan = User.objects.get(email='niranjant@karunya.edu.in')
    gokul = User.objects.get(email='gokulp@karunya.edu.in')
    earnest = User.objects.get(email='earnestkirubakaran@karunya.edu.in')
    
    # Get faculty for event coordinators
    grace_mary = User.objects.get(email='dotdev.test@gmail.com')
    nirmal_faculty = User.objects.get(email='niranjan2005official@gmail.com')
    sirija = User.objects.get(email='gokulp1806official@gmail.com')
    
    requests_data = [
        {
            'student': dickson,
            'date': date.today() - timedelta(days=5),
            'periods': [1, 2, 3],
            'event_coordinator': 'Grace Mary Kanaga',
            'event_coordinator_faculty': grace_mary,
            'proof_faculty': 'Antony Taurshia',
            'purpose': 'Attending workshop on Artificial Intelligence and Machine Learning technologies',
            'status': 'PENDING_MENTOR',
            'reason': None,
        },
        {
            'student': niranjan,
            'date': date.today() - timedelta(days=3),
            'periods': [4, 5, 6, 7],
            'event_coordinator': 'Nirmal',
            'event_coordinator_faculty': nirmal_faculty,
            'proof_faculty': 'Ebenezer',
            'purpose': 'Participating in National Level Hackathon organized by Tech University',
            'status': 'PENDING_HOD',
            'reason': None,
        },
        {
            'student': gokul,
            'date': date.today() - timedelta(days=10),
            'periods': [1, 2, 3, 4, 5],
            'event_coordinator': 'Grace Mary Kanaga',
            'event_coordinator_faculty': grace_mary,
            'proof_faculty': 'Jenefa',
            'purpose': 'Attending conference on Cloud Computing and DevOps practices',
            'status': 'APPROVED',
            'reason': None,
        },
        {
            'student': earnest,
            'date': date.today() - timedelta(days=7),
            'periods': [6, 7, 8],
            'event_coordinator': 'Sirija',
            'event_coordinator_faculty': sirija,
            'proof_faculty': 'Antony Taurshia',
            'purpose': 'Personal medical appointment scheduled with doctor',
            'status': 'DECLINED',
            'reason': 'Medical appointments do not qualify for event-based attendance exemption',
        },
    ]
    
    for req_data in requests_data:
        AttendanceRequest.objects.create(**req_data)
        status_emoji = {
            'PENDING_MENTOR': '⏳',
            'PENDING_HOD': '⏳',
            'APPROVED': '✅',
            'DECLINED': '❌',
        }
        emoji = status_emoji.get(req_data['status'], '📝')
        print(f"  {emoji} {req_data['student'].name} - {req_data['date']} - {req_data['status']}")
    
    print(f"✅ Created {len(requests_data)} attendance requests\n")

def print_summary():
    """Print summary of created data"""
    print("\n" + "="*60)
    print("📊 DATABASE SUMMARY")
    print("="*60)
    
    users_count = User.objects.count()
    students_count = User.objects.filter(role='Student').count()
    faculty_count = User.objects.filter(role='Faculty').count()
    hod_count = Faculty.objects.filter(is_hod=True).count()
    requests_count = AttendanceRequest.objects.count()
    
    print(f"👥 Total Users: {users_count}")
    print(f"   - Students: {students_count}")
    print(f"   - Faculty: {faculty_count}")
    print(f"   - HOD: {hod_count}")
    print(f"📝 Attendance Requests: {requests_count}")
    
    # Status breakdown
    print("\n📊 Request Status Breakdown:")
    statuses = ['PENDING_MENTOR', 'PENDING_HOD', 'APPROVED', 'DECLINED']
    for status in statuses:
        count = AttendanceRequest.objects.filter(status=status).count()
        if count > 0:
            print(f"   - {status}: {count}")
    
    print("\n" + "="*60)
    print("✨ SEED DATA CREATED SUCCESSFULLY!")
    print("="*60)
    
    print("\n🔑 LOGIN CREDENTIALS:")
    print("\nStudents (password: student123):")
    for student in User.objects.filter(role='Student'):
        print(f"  • {student.email}")
    
    print("\nFaculty (password: faculty123):")
    for faculty_user in User.objects.filter(role='Faculty'):
        faculty_profile = faculty_user.faculty_profile
        hod_tag = " [HOD]" if faculty_profile.is_hod else ""
        print(f"  • {faculty_user.email}{hod_tag}")

def main():
    """Main execution function"""
    print("\n" + "="*60)
    print("🌱 SEEDING DATABASE WITH KARUNYA UNIVERSITY DATA")
    print("="*60 + "\n")
    
    try:
        clear_database()
        create_students()
        create_faculty()
        create_attendance_requests()
        print_summary()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
