import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from attendance.models import User, Faculty, Student, AttendanceRequest

print("="*60)
print("📊 CURRENT DATABASE STATE")
print("="*60)

# Count users
users = User.objects.all()
students = User.objects.filter(role='Student')
faculty = User.objects.filter(role='Faculty')

print(f"\n👥 Users: {users.count()}")
print(f"   - Students: {students.count()}")
print(f"   - Faculty: {faculty.count()}")

print("\n👨‍🎓 Students:")
for student in students:
    print(f"  • {student.email} - {student.name}")

print("\n👨‍🏫 Faculty:")
for fac in faculty:
    try:
        faculty_profile = fac.faculty_profile
        hod_tag = " [HOD]" if faculty_profile.is_hod else ""
        print(f"  • {fac.email} - {fac.name}{hod_tag}")
    except:
        print(f"  • {fac.email} - {fac.name} [NO PROFILE]")

print(f"\n📝 Attendance Requests: {AttendanceRequest.objects.count()}")

# Status breakdown
statuses = ['PENDING_MENTOR', 'PENDING_HOD', 'APPROVED', 'DECLINED']
print("\n📊 Request Status:")
for status in statuses:
    count = AttendanceRequest.objects.filter(status=status).count()
    if count > 0:
        print(f"   - {status}: {count}")

print("\n" + "="*60)
