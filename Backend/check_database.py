"""
Script to check attendance requests in the database
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from attendance.models import AttendanceRequest, User

print("=" * 60)
print("ATTENDANCE REQUESTS IN POSTGRESQL DATABASE")
print("=" * 60)

total = AttendanceRequest.objects.count()
print(f"\n📊 Total requests in database: {total}\n")

if total > 0:
    print("Recent Requests:")
    print("-" * 60)
    for req in AttendanceRequest.objects.all().order_by('-created_at')[:10]:
        print(f"ID: {str(req.id)[:8]}...")
        print(f"  Student: {req.student.get_full_name()}")
        print(f"  Date: {req.date}")
        print(f"  Periods: {req.periods}")
        print(f"  Purpose: {req.purpose[:50]}...")
        print(f"  Status: {req.status}")
        print(f"  Created: {req.created_at.strftime('%Y-%m-%d %H:%M')}")
        print("-" * 60)
    
    # Status breakdown
    print("\n📈 Status Breakdown:")
    from django.db.models import Count
    status_counts = AttendanceRequest.objects.values('status').annotate(count=Count('status'))
    for item in status_counts:
        print(f"  {item['status']}: {item['count']} requests")
    
    # User breakdown
    print("\n👥 Requests Per Student:")
    user_counts = AttendanceRequest.objects.values('student__first_name', 'student__last_name').annotate(count=Count('id'))
    for item in user_counts[:5]:
        print(f"  {item['student__first_name']} {item['student__last_name']}: {item['count']} requests")

else:
    print("⚠️  No requests found in database!")

print("\n" + "=" * 60)
print("DATABASE LOCATION: PostgreSQL (configured in settings.py)")
print("=" * 60)
