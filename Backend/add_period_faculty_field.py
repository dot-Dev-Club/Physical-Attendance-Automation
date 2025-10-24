"""
Script to add period_faculty_mapping field directly to database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

# SQL to add the new column
sql = """
ALTER TABLE attendance_requests 
ADD COLUMN IF NOT EXISTS period_faculty_mapping JSONB DEFAULT '{}'::jsonb;
"""

try:
    with connection.cursor() as cursor:
        cursor.execute(sql)
        print("✅ Successfully added period_faculty_mapping column to attendance_requests table")
        
        # Verify the column exists
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'attendance_requests' 
            AND column_name = 'period_faculty_mapping';
        """)
        result = cursor.fetchone()
        if result:
            print(f"✅ Column verified: {result[0]} ({result[1]})")
        else:
            print("❌ Column not found after creation")
            
except Exception as e:
    print(f"❌ Error: {e}")
