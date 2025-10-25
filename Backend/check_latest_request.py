import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from attendance.models import AttendanceRequest, User

# Get the most recent request
latest_request = AttendanceRequest.objects.order_by('-created_at').first()

if latest_request:
    print(f"Latest Request:")
    print(f"  ID: {latest_request.id}")
    print(f"  Student: {latest_request.student.name}")
    print(f"  Date: {latest_request.date}")
    print(f"  Status: {latest_request.status}")
    print(f"  Event Coordinator (name): {latest_request.event_coordinator}")
    print(f"  Event Coordinator Faculty (FK): {latest_request.event_coordinator_faculty}")
    if latest_request.event_coordinator_faculty:
        print(f"    Faculty Name: {latest_request.event_coordinator_faculty.name}")
        print(f"    Faculty ID: {latest_request.event_coordinator_faculty.id}")
    else:
        print(f"    ⚠️  WARNING: event_coordinator_faculty is NULL!")
        print(f"    This means the request won't show up for any faculty!")
        
        # Try to find the faculty by name
        print(f"\n  Trying to find faculty by name '{latest_request.event_coordinator}'...")
        try:
            faculty = User.objects.get(first_name__icontains=latest_request.event_coordinator.split()[0], role='Faculty')
            print(f"  ✓ Found faculty: {faculty.name} (ID: {faculty.id})")
            print(f"  To fix: Update event_coordinator_faculty to this user")
        except User.DoesNotExist:
            print(f"  ✗ No faculty found with that name")
        except User.MultipleObjectsReturned:
            print(f"  ✗ Multiple faculty found with similar name")
