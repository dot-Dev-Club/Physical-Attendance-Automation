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
        
        # Clear existing data
        self.stdout.write('Clearing existing data...')
        AttendanceRequest.objects.all().delete()
        Student.objects.all().delete()
        Faculty.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        self.stdout.write(self.style.SUCCESS('✓ Cleared\n'))
        
        # Create Students
        students_data = [
            {'username': 'urk23ai1090', 'email': 'gokulp@karunya.edu.in', 'first_name': 'Gokul', 'last_name': 'P'},
            {'username': 'urk23ai1103', 'email': 'niranjant@karunya.edu.in', 'first_name': 'Niranjan', 'last_name': 'T'},
            {'username': 'urk23ai1072', 'email': 'dicksone@karunya.edu.in', 'first_name': 'Dickson', 'last_name': 'E'},
            {'username': 'urk23ai1046', 'email': 'earnestkirubakaran@karunya.edu.in', 'first_name': 'Earnest', 'last_name': 'Kirubakaran'},
            {'username': 'urk23ai1082', 'email': 'ariesnathya@karunya.edu.in', 'first_name': 'Aries', 'last_name': 'Nathya'},
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
                'username': 'antony.taurshia',
                'email': 'aparna6024@gmail.com',
                'first_name': 'Antony',
                'last_name': 'Taurshia',
                'title': 'Assistant Professor, Computer Science',
                'department': 'Computer Science',
                'is_hod': False
            },
            {
                'username': 'nirmal',
                'email': 'aparnaj@karunya.edu.in',
                'first_name': 'Nirmal',
                'last_name': '',
                'title': 'Assistant Professor, Computer Science',
                'department': 'Computer Science',
                'is_hod': False
            },
            {
                'username': 'ebenezer',
                'email': 'premadevasri639@gmail.com',
                'first_name': 'Ebenezer',
                'last_name': '',
                'title': 'Assistant Professor, Computer Science',
                'department': 'Computer Science',
                'is_hod': False
            },
            {
                'username': 'jenefa',
                'email': 'dharshankumarj.dev@gmail.com',
                'first_name': 'Jenefa',
                'last_name': '',
                'title': 'Assistant Professor, Computer Science',
                'department': 'Computer Science',
                'is_hod': False
            },
            {
                'username': 'sirija',
                'email': 'dharshankumarlearn@gmail.com',
                'first_name': 'Sirija',
                'last_name': '',
                'title': 'Assistant Professor, Computer Science',
                'department': 'Computer Science',
                'is_hod': False
            },
            {
                'username': 'hlomailapi',
                'email': 'hlomailapi@gmail.com',
                'first_name': 'Staff',
                'last_name': '6',
                'title': 'Assistant Professor, Computer Science',
                'department': 'Computer Science',
                'is_hod': False
            },
            {
                'username': 'ronnieallen2005',
                'email': 'ronnieallen2005@gmail.com',
                'first_name': 'Staff',
                'last_name': '7',
                'title': 'Assistant Professor, Computer Science',
                'department': 'Computer Science',
                'is_hod': False
            },
            {
                'username': 'kevin.j.savarimuthu',
                'email': 'kevin.j.savarimuthu@gmail.com',
                'first_name': 'Staff',
                'last_name': '8',
                'title': 'Assistant Professor, Computer Science',
                'department': 'Computer Science',
                'is_hod': False
            },
            {
                'username': 'sanjaysagar.main',
                'email': 'sanjaysagar.main@gmail.com',
                'first_name': 'Staff',
                'last_name': '9',
                'title': 'Assistant Professor, Computer Science',
                'department': 'Computer Science',
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
                'username': 'grace.mary',
                'email': 'dotdev.atom@gmail.com',
                'first_name': 'Grace Mary',
                'last_name': 'Kanaga',
                'title': 'Professor, Computer Science (HOD)',
                'department': 'Computer Science',
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
                    'event_coordinator': 'Grace Mary Kanaga',
                    'proof_faculty': 'Antony Taurshia',
                    'purpose': 'Attending workshop on Artificial Intelligence and Machine Learning',
                    'status': 'PENDING_MENTOR'
                },
                {
                    'student': students[1],
                    'date': today - timedelta(days=3),
                    'periods': [4, 5, 6, 7],
                    'event_coordinator': 'Nirmal',
                    'proof_faculty': 'Ebenezer',
                    'purpose': 'Participating in National Level Hackathon organized by Tech University',
                    'status': 'PENDING_HOD'
                },
                {
                    'student': students[0],
                    'date': today - timedelta(days=10),
                    'periods': [1, 2, 3, 4, 5],
                    'event_coordinator': 'Grace Mary Kanaga',
                    'proof_faculty': 'Jenefa',
                    'purpose': 'Attending conference on Cloud Computing and DevOps practices',
                    'status': 'APPROVED'
                },
                {
                    'student': students[2],
                    'date': today - timedelta(days=7),
                    'periods': [6, 7, 8],
                    'event_coordinator': 'Sirija',
                    'proof_faculty': 'Antony Taurshia',
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
        self.stdout.write('Students (Password: student123):')
        self.stdout.write('  Email: gokulp@karunya.edu.in')
        self.stdout.write('  Email: niranjant@karunya.edu.in')
        self.stdout.write('  Email: dicksone@karunya.edu.in')
        self.stdout.write('  Email: earnestkirubakaran@karunya.edu.in')
        self.stdout.write('  Email: ariesnathya@karunya.edu.in')
        self.stdout.write('\nFaculty - Regular (Password: faculty123):')
        self.stdout.write('  Email: aparna6024@gmail.com (Antony Taurshia)')
        self.stdout.write('  Email: aparnaj@karunya.edu.in (Nirmal)')
        self.stdout.write('  Email: premadevasri639@gmail.com (Ebenezer)')
        self.stdout.write('  Email: dharshankumarj.dev@gmail.com (Jenefa)')
        self.stdout.write('  Email: dharshankumarlearn@gmail.com (Sirija)')
        self.stdout.write('  Email: hlomailapi@gmail.com (Staff 6)')
        self.stdout.write('  Email: ronnieallen2005@gmail.com (Staff 7)')
        self.stdout.write('  Email: kevin.j.savarimuthu@gmail.com (Staff 8)')
        self.stdout.write('  Email: sanjaysagar.main@gmail.com (Staff 9)')
        self.stdout.write('\nFaculty - HOD (Password: faculty123):')
        self.stdout.write('  Email: dotdev.atom@gmail.com (Grace Mary Kanaga) [HOD]')
        self.stdout.write('─' * 50)
