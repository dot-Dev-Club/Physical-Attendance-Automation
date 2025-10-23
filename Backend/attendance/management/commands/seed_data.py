"""
Management command to seed test data for development.

Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from attendance.models import Faculty, Student, AttendanceRequest
from datetime import date, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with test users and sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database with test data...\n')
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        # AttendanceRequest.objects.all().delete()
        # Student.objects.all().delete()
        # Faculty.objects.all().delete()
        # User.objects.filter(is_superuser=False).delete()
        
        # Create Students
        students_data = [
            {'username': 'dickson', 'email': 'dickson@university.edu', 'first_name': 'Dickson', 'last_name': 'Student'},
            {'username': 'niranjan', 'email': 'niranjan@university.edu', 'first_name': 'Niranjan', 'last_name': 'Kumar'},
            {'username': 'gokul', 'email': 'gokul@university.edu', 'first_name': 'Gokul', 'last_name': 'Raj'},
            {'username': 'earnest', 'email': 'earnest@university.edu', 'first_name': 'Earnest', 'last_name': 'Johnson'},
        ]
        
        students = []
        for student_data in students_data:
            user, created = User.objects.get_or_create(
                email=student_data['email'],
                defaults={
                    'username': student_data['username'],
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name'],
                    'role': 'Student'
                }
            )
            if created:
                user.set_password('student123')
                user.save()
                self.stdout.write(self.style.SUCCESS(f'✓ Created student: {user.email}'))
            students.append(user)
        
        # Create Faculty (Regular Mentors)
        faculty_data = [
            {
                'username': 'evelyn.reed',
                'email': 'evelyn.reed@university.edu',
                'first_name': 'Evelyn',
                'last_name': 'Reed',
                'title': 'Professor, Computer Science',
                'department': 'Computer Science',
                'is_hod': False
            },
            {
                'username': 'robert.chen',
                'email': 'robert.chen@university.edu',
                'first_name': 'Robert',
                'last_name': 'Chen',
                'title': 'Associate Professor, Mathematics',
                'department': 'Mathematics',
                'is_hod': False
            },
        ]
        
        for fac_data in faculty_data:
            user, created = User.objects.get_or_create(
                email=fac_data['email'],
                defaults={
                    'username': fac_data['username'],
                    'first_name': fac_data['first_name'],
                    'last_name': fac_data['last_name'],
                    'role': 'Faculty'
                }
            )
            if created:
                user.set_password('faculty123')
                user.save()
            
            faculty, fac_created = Faculty.objects.get_or_create(
                user=user,
                defaults={
                    'title': fac_data['title'],
                    'department': fac_data['department'],
                    'is_hod': fac_data['is_hod']
                }
            )
            if created or fac_created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created faculty: {user.email} (Mentor)'))
        
        # Create HODs
        hod_data = [
            {
                'username': 'maria.chen',
                'email': 'maria.chen@university.edu',
                'first_name': 'Maria',
                'last_name': 'Chen',
                'title': 'Professor, Computer Science (HOD)',
                'department': 'Computer Science',
                'is_hod': True
            },
            {
                'username': 'james.anderson',
                'email': 'james.anderson@university.edu',
                'first_name': 'James',
                'last_name': 'Anderson',
                'title': 'Professor, Information Technology (HOD)',
                'department': 'Information Technology',
                'is_hod': True
            },
        ]
        
        for hod_info in hod_data:
            user, created = User.objects.get_or_create(
                email=hod_info['email'],
                defaults={
                    'username': hod_info['username'],
                    'first_name': hod_info['first_name'],
                    'last_name': hod_info['last_name'],
                    'role': 'Faculty'
                }
            )
            if created:
                user.set_password('faculty123')
                user.save()
            
            faculty, fac_created = Faculty.objects.get_or_create(
                user=user,
                defaults={
                    'title': hod_info['title'],
                    'department': hod_info['department'],
                    'is_hod': hod_info['is_hod']
                }
            )
            if created or fac_created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created faculty: {user.email} (HOD)'))
        
        # Create sample attendance requests
        if students:
            today = date.today()
            
            # Sample requests with different statuses
            sample_requests = [
                {
                    'student': students[0],
                    'date': today - timedelta(days=5),
                    'periods': [1, 2, 3],
                    'event_coordinator': 'Dr. Smith',
                    'proof_faculty': 'Dr. Johnson',
                    'purpose': 'Attending workshop on Artificial Intelligence and Machine Learning',
                    'status': 'PENDING_MENTOR'
                },
                {
                    'student': students[1],
                    'date': today - timedelta(days=3),
                    'periods': [4, 5, 6, 7],
                    'event_coordinator': 'Dr. Reed',
                    'proof_faculty': 'Dr. Chen',
                    'purpose': 'Participating in National Level Hackathon organized by Tech University',
                    'status': 'PENDING_HOD'
                },
                {
                    'student': students[0],
                    'date': today - timedelta(days=10),
                    'periods': [1, 2, 3, 4, 5],
                    'event_coordinator': 'Dr. Anderson',
                    'proof_faculty': 'Dr. Maria Chen',
                    'purpose': 'Attending conference on Cloud Computing and DevOps practices',
                    'status': 'APPROVED'
                },
                {
                    'student': students[2],
                    'date': today - timedelta(days=7),
                    'periods': [6, 7, 8],
                    'event_coordinator': 'Dr. Williams',
                    'proof_faculty': 'Dr. Brown',
                    'purpose': 'Personal medical appointment',
                    'status': 'DECLINED',
                    'reason': 'Medical appointments do not qualify for event-based attendance exemption'
                },
            ]
            
            for req_data in sample_requests:
                req, created = AttendanceRequest.objects.get_or_create(
                    student=req_data['student'],
                    date=req_data['date'],
                    defaults={
                        'periods': req_data['periods'],
                        'event_coordinator': req_data['event_coordinator'],
                        'proof_faculty': req_data['proof_faculty'],
                        'purpose': req_data['purpose'],
                        'status': req_data['status'],
                        'reason': req_data.get('reason', '')
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(
                        f'✓ Created request: {req_data["student"].email} - {req_data["status"]}'
                    ))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeded successfully!'))
        self.stdout.write('\nTest Credentials:')
        self.stdout.write('─' * 50)
        self.stdout.write('Students:')
        self.stdout.write('  Email: dickson@university.edu | Password: student123')
        self.stdout.write('  Email: niranjan@university.edu | Password: student123')
        self.stdout.write('  Email: gokul@university.edu | Password: student123')
        self.stdout.write('  Email: earnest@university.edu | Password: student123')
        self.stdout.write('\nFaculty (Mentors):')
        self.stdout.write('  Email: evelyn.reed@university.edu | Password: faculty123')
        self.stdout.write('  Email: robert.chen@university.edu | Password: faculty123')
        self.stdout.write('\nFaculty (HODs):')
        self.stdout.write('  Email: maria.chen@university.edu | Password: faculty123')
        self.stdout.write('  Email: james.anderson@university.edu | Password: faculty123')
        self.stdout.write('─' * 50)
