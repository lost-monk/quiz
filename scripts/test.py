import requests
import csv
import time
import random

def fetch_questions(limit=50):
    # API URL for The Trivia API v2
    url = f"https://the-trivia-api.com/v2/questions?limit={limit}"
    response = requests.get(url)
    response.raise_for_status() # Check for HTTP errors
    return response.json()

# Mapping API text categories to your specific Database IDs
# Based on your previous data: 1=Geo, 2=Science, 3=History/General, 4=Arts
category_map = {
    "geography": 1,
    "science": 2,
    "history": 3,
    "arts_and_literature": 4,
    "film_and_tv": 4, # Mapping film to Arts
    "music": 4,        # Mapping music to Arts
    "sport_and_leisure": 3, # Mapping sports to General/History
    "society_and_culture": 3,
    "food_and_drink": 3,
    "general_knowledge": 3
}

all_questions = []
target_count = 3000
filename = 'trivia_3000.csv'

print(f"Starting fetch for {target_count} questions...")

while len(all_questions) < target_count:
    try:
        # Fetch a batch
        data = fetch_questions(50)
        
        for item in data:
            if len(all_questions) >= target_count:
                break
                
            # Prepare options and shuffle them
            correct_ans = item['correctAnswer']
            options = item['incorrectAnswers'] + [correct_ans]
            random.shuffle(options)
            
            # Map the category string to a number. Default to 3 (General) if not found.
            api_cat = item['category']
            numeric_cat_id = category_map.get(api_cat, 3) 
            
            row = {
                "question": item['question']['text'],
                "option_1": options[0],
                "option_2": options[1],
                "option_3": options[2],
                "option_4": options[3],
                "correct_answer": options.index(correct_ans) + 1,
                "category_id": numeric_cat_id, # Now outputs an Integer
                "display_date": "",
                "created_by": "system",
                "updated_by": ""
            }
            all_questions.append(row)
        
        print(f"Progress: {len(all_questions)}/{target_count}")
        time.sleep(1) # Brief pause to be polite to the API
        
    except Exception as e:
        print(f"An error occurred: {e}")
        break

# Save to CSV
if all_questions:
    keys = all_questions[0].keys()
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        dict_writer = csv.DictWriter(f, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(all_questions)
    print(f"\nSuccess! Saved {len(all_questions)} questions to {filename}")
else:
    print("No questions were collected.")