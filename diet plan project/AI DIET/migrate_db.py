import sqlite3
import os

# Database file path
db_path = os.path.join(os.getcwd(), 'backend', 'diet_app.db')

def add_column(cursor, table, column, col_type):
    try:
        print(f"Attempting to add column {column} to {table}...")
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
        print(f"Successfully added column {column}.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"Column {column} already exists in {table}.")
        else:
            print(f"Error adding {column}: {e}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Add new columns to profile table
    add_column(cursor, 'profile', 'gender', 'VARCHAR(20)')
    add_column(cursor, 'profile', 'allergies', 'VARCHAR(200)')
    add_column(cursor, 'profile', 'medical_conditions', 'VARCHAR(200)')
    
    conn.commit()
    conn.close()
    print("Migration completed.")
else:
    print(f"Database not found at {db_path}")
