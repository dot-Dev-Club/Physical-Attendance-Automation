"""
Hash passwords for all users in the database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from attendance.models import User
from django.contrib.auth.hashers import make_password

print("="*60)
print("🔐 HASHING USER PASSWORDS")
print("="*60)

# Get all users
users = User.objects.all()
print(f"\n👥 Found {users.count()} users")

updated = 0
for user in users:
    # Check if password is already hashed (hashed passwords start with algorithm identifier)
    if not (user.password.startswith('pbkdf2_') or user.password.startswith('bcrypt') or user.password.startswith('argon2')):
        # Password is plain text, need to hash it
        plain_password = user.password
        
        # Determine the correct password based on role
        if user.role == 'Student':
            correct_password = 'student123'
        else:
            correct_password = 'faculty123'
        
        # Hash the password
        user.password = make_password(correct_password)
        user.save()
        
        print(f"  ✓ Hashed password for: {user.email} ({user.role})")
        updated += 1
    else:
        print(f"  → Already hashed: {user.email}")

print(f"\n📊 Summary:")
print(f"   - Updated: {updated}")
print(f"   - Already hashed: {users.count() - updated}")

print("\n" + "="*60)
print("✨ ALL PASSWORDS HASHED!")
print("="*60)
print("\n🔑 Login credentials:")
print("   Students: password = student123")
print("   Faculty: password = faculty123")
