"""
Create sample attendance requests
"""
import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from attendance.models import User, AttendanceRequest

print("="*60)
print("📝 CREATING SAMPLE ATTENDANCE REQUESTS")
print("="*60)

# Get users
try:
    dickson = User.objects.get(email='dicksone@karunya.edu.in')
    niranjan = User.objects.get(email='niranjant@karunya.edu.in')
    gokul = User.objects.get(email='gokulp@karunya.edu.in')
    earnest = User.objects.get(email='earnestkirubakaran@karunya.edu.in')
    
    # Get faculty for event coordinators
    grace_mary = User.objects.get(email='dotdev.test@gmail.com')
    nirmal_faculty = User.objects.get(email='niranjan2005official@gmail.com')
    sirija = User.objects.get(email='gokulp1806official@gmail.com')
    
    print("\n✓ All users found")
except User.DoesNotExist as e:
    print(f"❌ Error: User not found - {e}")
    exit(1)

# Create requests
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

print("\n📝 Creating requests...")
created = 0

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
    created += 1

print(f"\n✅ Created {created} attendance requests")

# Summary
print("\n📊 Database Summary:")
print(f"   - Total Requests: {AttendanceRequest.objects.count()}")
statuses = ['PENDING_MENTOR', 'PENDING_HOD', 'APPROVED', 'DECLINED']
for status in statuses:
    count = AttendanceRequest.objects.filter(status=status).count()
    if count > 0:
        print(f"   - {status}: {count}")

print("\n" + "="*60)
print("✨ SAMPLE REQUESTS CREATED!")
print("="*60)
