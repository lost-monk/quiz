import sqlite3
import csv
import os
import argparse

# --- Configuration ---
DB_FILE = '../public/example.db-data'
TABLE_NAME = 'quiz_questions'

# Columns we want to map from CSV to Database
# We use a dictionary mapping to handle different column names if needed
COLUMNS = [
    'question', 'option_1', 'option_2', 'option_3', 'option_4', 
    'correct_answer', 'category_id', 'display_date', 'created_by', 'updated_by'
]

def import_csv_to_sqlite(csv_file_path):
    if not os.path.exists(DB_FILE):
        print(f"Error: Database file not found at {DB_FILE}")
        return

    if not os.path.exists(csv_file_path):
        print(f"Error: CSV file not found at {csv_file_path}")
        return

    conn = None
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        print(f"Reading data from: {csv_file_path}")
        
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            # DictReader uses the first row of CSV as keys
            reader = csv.DictReader(f)
            data_to_insert = []
            
            for i, row in enumerate(reader):
                processed_row = []
                try:
                    # 1. Required: Question and Options
                    processed_row.append(row['question'])
                    processed_row.append(row['option_1'])
                    processed_row.append(row['option_2'])
                    processed_row.append(row['option_3'])
                    processed_row.append(row['option_4'])
                    
                    # 2. Required: Correct Answer (Must be int)
                    processed_row.append(int(row['correct_answer']))
                    
                    # 3. Optional: Category ID (Convert to int if exists, else None for NULL)
                    cat_id = row.get('category_id', '').strip()
                    processed_row.append(int(cat_id) if cat_id else None)
                    
                    # 4. Optional: Display Date (None if empty)
                    disp_date = row.get('display_date', '').strip()
                    processed_row.append(disp_date if disp_date else None)
                    
                    # 5. Optional: Audit fields
                    processed_row.append(row.get('created_by', 'system'))
                    processed_row.append(row.get('updated_by', None))

                except (ValueError, KeyError) as e:
                    print(f"Warning: Skipping row {i+2}. Data error: {e}")
                    continue
                    
                data_to_insert.append(tuple(processed_row))

        # Dynamically build the insert string
        placeholders = ', '.join(['?'] * len(COLUMNS))
        insert_sql = f"INSERT INTO {TABLE_NAME} ({', '.join(COLUMNS)}) VALUES ({placeholders})"
        
        cursor.executemany(insert_sql, data_to_insert)
        conn.commit()
        print(f"Successfully imported {len(data_to_insert)} rows into {TABLE_NAME}.")

    except sqlite3.Error as e:
        print(f"SQLite Error: {e}")
        if conn: conn.rollback()
    finally:
        if conn: conn.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Import quiz CSV into SQLite.")
    parser.add_argument('csv_path', type=str, help='Path to input CSV file')
    args = parser.parse_args()
    import_csv_to_sqlite(args.csv_path)