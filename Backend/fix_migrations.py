"""
Fix migration history
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        # Mark attendance migration as applied
        cursor.execute("""
            INSERT INTO django_migrations (app, name, applied)
            VALUES ('attendance', '0001_initial', NOW())
            ON CONFLICT DO NOTHING;
        """)
        print("✅ Migration marked as applied")
        
        # Verify
        cursor.execute("""
            SELECT app, name, applied 
            FROM django_migrations 
            WHERE app = 'attendance';
        """)
        for row in cursor.fetchall():
            print(f"  {row[0]}.{row[1]} - {row[2]}")
            
except Exception as e:
    print(f"❌ Error: {e}")
