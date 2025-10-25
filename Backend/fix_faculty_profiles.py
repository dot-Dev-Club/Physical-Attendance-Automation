"""
Fix database: Create missing faculty profiles for faculty users
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from attendance.models import User, Faculty

print("="*60)
print("🔧 FIXING FACULTY PROFILES IN DATABASE")
print("="*60)

# Get all faculty users
faculty_users = User.objects.filter(role='Faculty')
print(f"\n👨‍🏫 Found {faculty_users.count()} faculty users")

# Define faculty profile data
faculty_profiles = {
    'dotdev.test@gmail.com': {
        'title': 'Professor, Computer Science (HOD)',
        'department': 'Computer Science',
        'is_hod': True
    },
    'dicksone2006@gmail.com': {
        'title': 'Assistant Professor, Computer Science',
        'department': 'Computer Science',
        'is_hod': False
    },
    'niranjan2005official@gmail.com': {
        'title': 'Assistant Professor, Computer Science',
        'department': 'Computer Science',
        'is_hod': False
    },
    'earni8105@gmail.com': {
        'title': 'Assistant Professor, Computer Science',
        'department': 'Computer Science',
        'is_hod': False
    },
    'ariesnathya@gmail.com': {
        'title': 'Assistant Professor, Computer Science',
        'department': 'Computer Science',
        'is_hod': False
    },
    'gokulp1806official@gmail.com': {
        'title': 'Assistant Professor, Computer Science',
        'department': 'Computer Science',
        'is_hod': False
    }
}

created = 0
updated = 0
errors = 0

for faculty_user in faculty_users:
    try:
        profile_data = faculty_profiles.get(faculty_user.email)
        
        if not profile_data:
            print(f"  ⚠️  No profile data for {faculty_user.email}")
            errors += 1
            continue
        
        # Check if profile exists
        try:
            faculty_profile = faculty_user.faculty_profile
            # Profile exists, update it
            faculty_profile.title = profile_data['title']
            faculty_profile.department = profile_data['department']
            faculty_profile.is_hod = profile_data['is_hod']
            faculty_profile.save()
            
            hod_tag = " [HOD]" if profile_data['is_hod'] else ""
            print(f"  ✓ Updated: {faculty_user.name}{hod_tag}")
            updated += 1
            
        except Faculty.DoesNotExist:
            # Profile doesn't exist, create it
            Faculty.objects.create(
                user=faculty_user,
                title=profile_data['title'],
                department=profile_data['department'],
                is_hod=profile_data['is_hod']
            )
            
            hod_tag = " [HOD]" if profile_data['is_hod'] else ""
            print(f"  ✓ Created: {faculty_user.name}{hod_tag}")
            created += 1
            
    except Exception as e:
        print(f"  ❌ Error for {faculty_user.email}: {e}")
        errors += 1

print(f"\n📊 Summary:")
print(f"   - Created: {created}")
print(f"   - Updated: {updated}")
print(f"   - Errors: {errors}")

# Verify
print(f"\n✅ Verification:")
print(f"   - Total Faculty profiles: {Faculty.objects.count()}")
print(f"   - HODs: {Faculty.objects.filter(is_hod=True).count()}")

print("\n" + "="*60)
print("✨ FACULTY PROFILES FIXED!")
print("="*60)
