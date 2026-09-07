from datetime import date, datetime, timedelta, timezone
from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.course import Course, Unit, Skill
from app.models.lesson import Lesson, Exercise
from app.models.progress import UserProgress
from app.models.stats import UserStats, DailyActivity
from app.models.gamification import LeaderboardEntry, Achievement, UserAchievement


def seed_database():
    """Drop and recreate all tables, then seed English course curriculum, exercises, users, and gamification."""
    print("Dropping and recreating all SQLite database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding Course: English for Beginners...")
        course = Course(
            title="English for Beginners",
            description="Master everyday conversational English with fun, bite-sized lessons, interactive challenges, and spaced repetition.",
            source_language="global",
            target_language="en",
            flag_emoji="🇬🇧",
            order_index=1
        )
        db.add(course)
        db.flush()

        # =========================================================================
        # UNIT 1: Greetings, Basic Words & Introductions
        # =========================================================================
        print("Seeding Unit 1: Greetings, Basic Words & Introductions...")
        unit1 = Unit(
            course_id=course.id,
            title="Unit 1: Greetings, Basic Words & Introductions",
            description="Say hello, learn essential courtesy words, and introduce yourself with confidence.",
            order_index=1
        )
        db.add(unit1)
        db.flush()

        # --- Skill 1.1: Greetings ---
        skill_greetings = Skill(
            unit_id=unit1.id,
            title="Greetings",
            description="Essential greetings, polite words, and goodbyes.",
            icon="chat",
            order_index=1
        )
        db.add(skill_greetings)
        db.flush()

        # Lesson 1.1.1: Hello & Goodbye
        lesson1_1_1 = Lesson(
            skill_id=skill_greetings.id,
            title="Hello & Goodbye",
            order_index=1,
            xp_reward=15
        )
        db.add(lesson1_1_1)
        db.flush()

        ex_1_1_1 = [
            Exercise(
                lesson_id=lesson1_1_1.id,
                type="multiple_choice",
                prompt="Which one of these is the most common greeting?",
                content={
                    "options": [
                        {"id": "1", "text": "Hello", "image": "👋"},
                        {"id": "2", "text": "Goodbye", "image": "🚶"},
                        {"id": "3", "text": "Please", "image": "🙏"}
                    ]
                },
                correct_answer="Hello",
                explanation="'Hello' is the standard universal English greeting.",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson1_1_1.id,
                type="translate_to_target",
                prompt="Form the greeting: 'Good morning, how are you?'",
                content={
                    "source_sentence": "Good morning, how are you?",
                    "word_bank": ["Good", "morning,", "how", "are", "you?", "night", "thanks", "fine"]
                },
                correct_answer=["Good", "morning,", "how", "are", "you?"],
                explanation="'Good morning' is used before noon, followed by 'how are you?'.",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson1_1_1.id,
                type="translate_to_source",
                prompt="Arrange the farewell: 'Goodbye, see you later.'",
                content={
                    "target_sentence": "Goodbye, see you later.",
                    "word_bank": ["Goodbye,", "see", "you", "later.", "Hello,", "tomorrow", "friend"]
                },
                correct_answer=["Goodbye,", "see", "you", "later."],
                explanation="'Goodbye, see you later' is a polite and common way to depart.",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson1_1_1.id,
                type="match_pairs",
                prompt="Tap the matching pairs of words:",
                content={
                    "pairs": [
                        {"left": "Hello", "right": "Hi"},
                        {"left": "Goodbye", "right": "Bye"},
                        {"left": "Thank you", "right": "Thanks"},
                        {"left": "Please", "right": "Kindly"},
                        {"left": "Yes", "right": "Yeah"}
                    ]
                },
                correct_answer={"Hello": "Hi", "Goodbye": "Bye", "Thank you": "Thanks", "Please": "Kindly", "Yes": "Yeah"},
                explanation="Great job matching informal and formal English greetings!",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson1_1_1.id,
                type="fill_in_blank",
                prompt="Complete the sentence:",
                content={
                    "sentence_parts": ["Good ", ", have a wonderful day!"],
                    "blank_options": ["morning", "table", "water", "apple"]
                },
                correct_answer="morning",
                explanation="'Good morning' is the standard polite greeting for the start of the day.",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson1_1_1.id,
                type="type_answer",
                prompt="Type the standard farewell word:",
                content={
                    "hint": "Starts with G and has 7 letters."
                },
                correct_answer="Goodbye",
                explanation="'Goodbye' is the universal English farewell.",
                order_index=6
            ),
        ]
        db.add_all(ex_1_1_1)

        # Lesson 1.1.2: Times of Day Greetings
        lesson1_1_2 = Lesson(
            skill_id=skill_greetings.id,
            title="Times of Day Greetings",
            order_index=2,
            xp_reward=15
        )
        db.add(lesson1_1_2)
        db.flush()

        ex_1_1_2 = [
            Exercise(
                lesson_id=lesson1_1_2.id,
                type="multiple_choice",
                prompt="Which greeting do you say before going to bed?",
                content={
                    "options": [
                        {"id": "1", "text": "Good night", "image": "🌙"},
                        {"id": "2", "text": "Good morning", "image": "☀️"},
                        {"id": "3", "text": "Good afternoon", "image": "🌅"}
                    ]
                },
                correct_answer="Good night",
                explanation="'Good night' is used when leaving in the evening or heading to sleep.",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson1_1_2.id,
                type="translate_to_target",
                prompt="Assemble: 'See you tomorrow, my friend.'",
                content={
                    "source_sentence": "See you tomorrow, my friend.",
                    "word_bank": ["See", "you", "tomorrow,", "my", "friend.", "later", "morning", "night"]
                },
                correct_answer=["See", "you", "tomorrow,", "my", "friend."],
                explanation="'See you tomorrow' specifies seeing the person on the following day.",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson1_1_2.id,
                type="match_pairs",
                prompt="Match times of day with their time periods:",
                content={
                    "pairs": [
                        {"left": "Morning", "right": "AM (Early)"},
                        {"left": "Afternoon", "right": "PM (Midday)"},
                        {"left": "Evening", "right": "Dusk (Later)"},
                        {"left": "Night", "right": "Bedtime"},
                        {"left": "Tomorrow", "right": "Next day"}
                    ]
                },
                correct_answer={"Morning": "AM (Early)", "Afternoon": "PM (Midday)", "Evening": "Dusk (Later)", "Night": "Bedtime", "Tomorrow": "Next day"},
                explanation="Well done matching parts of the day!",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson1_1_2.id,
                type="fill_in_blank",
                prompt="Complete the sentence:",
                content={
                    "sentence_parts": ["Good ", ", it is lunchtime!"],
                    "blank_options": ["afternoon", "night", "yesterday", "sleep"]
                },
                correct_answer="afternoon",
                explanation="'Good afternoon' is used between 12:00 PM and evening.",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson1_1_2.id,
                type="type_answer",
                prompt="Type the greeting for the start of the day:",
                content={
                    "hint": "Starts with 'Good m...'"
                },
                correct_answer="Good morning",
                explanation="'Good morning' starts the English day.",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson1_1_2.id,
                type="multiple_choice",
                prompt="How do you politely answer 'How are you?'",
                content={
                    "options": [
                        {"id": "1", "text": "I am doing well, thank you!", "image": "😊"},
                        {"id": "2", "text": "I am a chair.", "image": "🪑"},
                        {"id": "3", "text": "Goodbye!", "image": "🚪"}
                    ]
                },
                correct_answer="I am doing well, thank you!",
                explanation="'I am doing well, thank you!' is polite and positive.",
                order_index=6
            ),
        ]
        db.add_all(ex_1_1_2)

        # --- Skill 1.2: Essential Words ---
        skill_essential = Skill(
            unit_id=unit1.id,
            title="Essential Words",
            description="Polite expressions, basic agreements, and daily courtesy words.",
            icon="book",
            order_index=2
        )
        db.add(skill_essential)
        db.flush()

        # Lesson 1.2.1: Yes, No & Please
        lesson1_2_1 = Lesson(
            skill_id=skill_essential.id,
            title="Yes, No & Please",
            order_index=1,
            xp_reward=15
        )
        db.add(lesson1_2_1)
        db.flush()

        ex_1_2_1 = [
            Exercise(
                lesson_id=lesson1_2_1.id,
                type="multiple_choice",
                prompt="Which word is used to express gratitude?",
                content={
                    "options": [
                        {"id": "1", "text": "Thank you", "image": "🙏"},
                        {"id": "2", "text": "No", "image": "❌"},
                        {"id": "3", "text": "Never", "image": "🚫"}
                    ]
                },
                correct_answer="Thank you",
                explanation="'Thank you' shows appreciation and politeness.",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson1_2_1.id,
                type="translate_to_target",
                prompt="Assemble the polite sentence:",
                content={
                    "source_sentence": "Yes, please and thank you.",
                    "word_bank": ["Yes,", "please", "and", "thank", "you.", "no", "never", "bad"]
                },
                correct_answer=["Yes,", "please", "and", "thank", "you."],
                explanation="'Yes, please' and 'thank you' are foundational manners in English.",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson1_2_1.id,
                type="match_pairs",
                prompt="Match the courtesy phrases:",
                content={
                    "pairs": [
                        {"left": "Yes", "right": "Affirmative"},
                        {"left": "No", "right": "Negative"},
                        {"left": "Please", "right": "Request"},
                        {"left": "Thanks", "right": "Gratitude"},
                        {"left": "Welcome", "right": "Hospitality"}
                    ]
                },
                correct_answer={"Yes": "Affirmative", "No": "Negative", "Please": "Request", "Thanks": "Gratitude", "Welcome": "Hospitality"},
                explanation="Great job matching polite responses!",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson1_2_1.id,
                type="fill_in_blank",
                prompt="Complete the courteous response:",
                content={
                    "sentence_parts": ["You are ", ", anytime!"],
                    "blank_options": ["welcome", "bad", "angry", "running"]
                },
                correct_answer="welcome",
                explanation="'You are welcome' is the standard reply to 'Thank you'.",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson1_2_1.id,
                type="type_answer",
                prompt="Type the word used to make a polite request:",
                content={
                    "hint": "Starts with P and has 6 letters."
                },
                correct_answer="Please",
                explanation="'Please' softens requests into polite inquiries.",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson1_2_1.id,
                type="multiple_choice",
                prompt="What do you say if you bump into someone?",
                content={
                    "options": [
                        {"id": "1", "text": "Excuse me, I am sorry!", "image": "🤝"},
                        {"id": "2", "text": "Happy birthday!", "image": "🎂"},
                        {"id": "3", "text": "Delicious!", "image": "🍕"}
                    ]
                },
                correct_answer="Excuse me, I am sorry!",
                explanation="'Excuse me' or 'I am sorry' is the correct apology.",
                order_index=6
            ),
        ]
        db.add_all(ex_1_2_1)

        # --- Skill 1.3: Introductions ---
        skill_intro = Skill(
            unit_id=unit1.id,
            title="Introductions",
            description="Share your name, ask others who they are, and make acquaintances.",
            icon="users",
            order_index=3
        )
        db.add(skill_intro)
        db.flush()

        # Lesson 1.3.1: What is your name?
        lesson1_3_1 = Lesson(
            skill_id=skill_intro.id,
            title="What is your name?",
            order_index=1,
            xp_reward=15
        )
        db.add(lesson1_3_1)
        db.flush()

        ex_1_3_1 = [
            Exercise(
                lesson_id=lesson1_3_1.id,
                type="multiple_choice",
                prompt="Which sentence is used to introduce yourself?",
                content={
                    "options": [
                        {"id": "1", "text": "My name is John.", "image": "🙋‍♂️"},
                        {"id": "2", "text": "I am sleeping.", "image": "😴"},
                        {"id": "3", "text": "Where is the bus?", "image": "🚌"}
                    ]
                },
                correct_answer="My name is John.",
                explanation="'My name is [Name]' is the most common self-introduction.",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson1_3_1.id,
                type="translate_to_target",
                prompt="Assemble the question:",
                content={
                    "source_sentence": "What is your name?",
                    "word_bank": ["What", "is", "your", "name?", "how", "are", "they", "where"]
                },
                correct_answer=["What", "is", "your", "name?"],
                explanation="'What is your name?' is the classic way to ask someone's identity.",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson1_3_1.id,
                type="match_pairs",
                prompt="Match the introduction terms:",
                content={
                    "pairs": [
                        {"left": "Name", "right": "Identity"},
                        {"left": "City", "right": "Hometown"},
                        {"left": "Country", "right": "Nation"},
                        {"left": "Friend", "right": "Pal"},
                        {"left": "Language", "right": "English"}
                    ]
                },
                correct_answer={"Name": "Identity", "City": "Hometown", "Country": "Nation", "Friend": "Pal", "Language": "English"},
                explanation="Awesome work matching introduction vocabulary!",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson1_3_1.id,
                type="fill_in_blank",
                prompt="Complete the pleasantry:",
                content={
                    "sentence_parts": ["Nice to ", " you!"],
                    "blank_options": ["meet", "eat", "jump", "cry"]
                },
                correct_answer="meet",
                explanation="'Nice to meet you' expresses pleasure upon greeting someone new.",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson1_3_1.id,
                type="type_answer",
                prompt="Type the missing word: 'Nice to ___ you'",
                content={
                    "hint": "M-E-E-T"
                },
                correct_answer="meet",
                explanation="'Nice to meet you' is standard polite English.",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson1_3_1.id,
                type="multiple_choice",
                prompt="Which question asks about someone's origin?",
                content={
                    "options": [
                        {"id": "1", "text": "Where are you from?", "image": "🌍"},
                        {"id": "2", "text": "What time is it?", "image": "⏰"},
                        {"id": "3", "text": "How much is this?", "image": "🏷️"}
                    ]
                },
                correct_answer="Where are you from?",
                explanation="'Where are you from?' inquires about someone's country or city.",
                order_index=6
            ),
        ]
        db.add_all(ex_1_3_1)

        # =========================================================================
        # UNIT 2: Food, Numbers & Family
        # =========================================================================
        print("Seeding Unit 2: Food, Numbers & Family...")
        unit2 = Unit(
            course_id=course.id,
            title="Unit 2: Food, Numbers & Family",
            description="Order food at a restaurant, count from 1 to 10, and describe your family members.",
            order_index=2
        )
        db.add(unit2)
        db.flush()

        # --- Skill 2.1: Food & Drinks ---
        skill_food = Skill(
            unit_id=unit2.id,
            title="Food & Drinks",
            description="Order cafe beverages, meals, and essential grocery items.",
            icon="coffee",
            order_index=1
        )
        db.add(skill_food)
        db.flush()

        # Lesson 2.1.1: At the Cafe
        lesson2_1_1 = Lesson(
            skill_id=skill_food.id,
            title="At the Cafe",
            order_index=1,
            xp_reward=15
        )
        db.add(lesson2_1_1)
        db.flush()

        ex_2_1_1 = [
            Exercise(
                lesson_id=lesson2_1_1.id,
                type="multiple_choice",
                prompt="Which of these is a warm breakfast beverage?",
                content={
                    "options": [
                        {"id": "1", "text": "Coffee", "image": "☕"},
                        {"id": "2", "text": "Salt", "image": "🧂"},
                        {"id": "3", "text": "Fork", "image": "🍴"}
                    ]
                },
                correct_answer="Coffee",
                explanation="'Coffee' is a popular hot beverage made from roasted coffee beans.",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson2_1_1.id,
                type="translate_to_target",
                prompt="Assemble the cafe order:",
                content={
                    "source_sentence": "A coffee with milk, please.",
                    "word_bank": ["A", "coffee", "with", "milk,", "please.", "bread", "water", "tea"]
                },
                correct_answer=["A", "coffee", "with", "milk,", "please."],
                explanation="'A coffee with milk, please' is a natural cafe order.",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson2_1_1.id,
                type="match_pairs",
                prompt="Match foods with their descriptions:",
                content={
                    "pairs": [
                        {"left": "Water", "right": "Essential drink"},
                        {"left": "Bread", "right": "Bakery item"},
                        {"left": "Apple", "right": "Crisp fruit"},
                        {"left": "Tea", "right": "Herbal brew"},
                        {"left": "Milk", "right": "Dairy drink"}
                    ]
                },
                correct_answer={"Water": "Essential drink", "Bread": "Bakery item", "Apple": "Crisp fruit", "Tea": "Herbal brew", "Milk": "Dairy drink"},
                explanation="Great job identifying food items!",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson2_1_1.id,
                type="fill_in_blank",
                prompt="Complete the order:",
                content={
                    "sentence_parts": ["I would like a glass of ", ", please."],
                    "blank_options": ["water", "spoon", "shoe", "pencil"]
                },
                correct_answer="water",
                explanation="'A glass of water' is standard when ordering drinks.",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson2_1_1.id,
                type="type_answer",
                prompt="Type the staple food baked from flour and water:",
                content={
                    "hint": "Starts with B and ends with D (5 letters)."
                },
                correct_answer="Bread",
                explanation="'Bread' is a staple food eaten worldwide.",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson2_1_1.id,
                type="multiple_choice",
                prompt="Which fruit is red or green and keeps the doctor away?",
                content={
                    "options": [
                        {"id": "1", "text": "Apple", "image": "🍎"},
                        {"id": "2", "text": "Bread", "image": "🍞"},
                        {"id": "3", "text": "Coffee", "image": "☕"}
                    ]
                },
                correct_answer="Apple",
                explanation="An 'apple' is a crisp and healthy fruit.",
                order_index=6
            ),
        ]
        db.add_all(ex_2_1_1)

        # --- Skill 2.2: Numbers ---
        skill_numbers = Skill(
            unit_id=unit2.id,
            title="Numbers 1-10",
            description="Count numbers, understand prices, and state quantities.",
            icon="numbers",
            order_index=2
        )
        db.add(skill_numbers)
        db.flush()

        # Lesson 2.2.1: Counting 1 to 10
        lesson2_2_1 = Lesson(
            skill_id=skill_numbers.id,
            title="Counting 1 to 10",
            order_index=1,
            xp_reward=15
        )
        db.add(lesson2_2_1)
        db.flush()

        ex_2_2_1 = [
            Exercise(
                lesson_id=lesson2_2_1.id,
                type="multiple_choice",
                prompt="Which number comes after two?",
                content={
                    "options": [
                        {"id": "1", "text": "Three", "image": "3️⃣"},
                        {"id": "2", "text": "One", "image": "1️⃣"},
                        {"id": "3", "text": "Ten", "image": "🔟"}
                    ]
                },
                correct_answer="Three",
                explanation="'Three' (3) directly follows 'Two' (2).",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson2_2_1.id,
                type="translate_to_target",
                prompt="Count sequentially:",
                content={
                    "source_sentence": "One, two, and three.",
                    "word_bank": ["One,", "two,", "and", "three.", "five", "four", "nine", "zero"]
                },
                correct_answer=["One,", "two,", "and", "three."],
                explanation="'One, two, three' are the first three counting numbers.",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson2_2_1.id,
                type="match_pairs",
                prompt="Match digits with their written English words:",
                content={
                    "pairs": [
                        {"left": "1", "right": "One"},
                        {"left": "2", "right": "Two"},
                        {"left": "3", "right": "Three"},
                        {"left": "4", "right": "Four"},
                        {"left": "5", "right": "Five"}
                    ]
                },
                correct_answer={"1": "One", "2": "Two", "3": "Three", "4": "Four", "5": "Five"},
                explanation="Superb matching of digits to English words!",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson2_2_1.id,
                type="fill_in_blank",
                prompt="Complete the sequence:",
                content={
                    "sentence_parts": ["Four, five, and ", "."],
                    "blank_options": ["six", "car", "cloud", "tree"]
                },
                correct_answer="six",
                explanation="'Six' (6) comes after 'Five' (5).",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson2_2_1.id,
                type="type_answer",
                prompt="Type the English word for the number 10:",
                content={
                    "hint": "T-E-N"
                },
                correct_answer="Ten",
                explanation="'Ten' is 10 in English.",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson2_2_1.id,
                type="multiple_choice",
                prompt="How many fingers are on one human hand?",
                content={
                    "options": [
                        {"id": "1", "text": "Five", "image": "🖐️"},
                        {"id": "2", "text": "Two", "image": "✌️"},
                        {"id": "3", "text": "Ten", "image": "👐"}
                    ]
                },
                correct_answer="Five",
                explanation="A typical hand has five digits (four fingers and a thumb).",
                order_index=6
            ),
        ]
        db.add_all(ex_2_2_1)

        # --- Skill 2.3: Family ---
        skill_family = Skill(
            unit_id=unit2.id,
            title="Family Members",
            description="Talk about parents, siblings, relatives, and loved ones.",
            icon="family",
            order_index=3
        )
        db.add(skill_family)
        db.flush()

        # Lesson 2.3.1: My Family
        lesson2_3_1 = Lesson(
            skill_id=skill_family.id,
            title="My Family",
            order_index=1,
            xp_reward=15
        )
        db.add(lesson2_3_1)
        db.flush()

        ex_2_3_1 = [
            Exercise(
                lesson_id=lesson2_3_1.id,
                type="multiple_choice",
                prompt="Who is your female parent?",
                content={
                    "options": [
                        {"id": "1", "text": "Mother", "image": "👩"},
                        {"id": "2", "text": "Brother", "image": "👦"},
                        {"id": "3", "text": "Uncle", "image": "👨"}
                    ]
                },
                correct_answer="Mother",
                explanation="'Mother' is the formal term for female parent (also 'Mom').",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson2_3_1.id,
                type="translate_to_target",
                prompt="Assemble the family introduction:",
                content={
                    "source_sentence": "This is my father.",
                    "word_bank": ["This", "is", "my", "father.", "mother", "sister", "they", "we"]
                },
                correct_answer=["This", "is", "my", "father."],
                explanation="'This is my father' introduces your male parent.",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson2_3_1.id,
                type="match_pairs",
                prompt="Match family relations with informal terms:",
                content={
                    "pairs": [
                        {"left": "Mother", "right": "Mom"},
                        {"left": "Father", "right": "Dad"},
                        {"left": "Brother", "right": "Male sibling"},
                        {"left": "Sister", "right": "Female sibling"},
                        {"left": "Family", "right": "Relatives"}
                    ]
                },
                correct_answer={"Mother": "Mom", "Father": "Dad", "Brother": "Male sibling", "Sister": "Female sibling", "Family": "Relatives"},
                explanation="Great job matching family members!",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson2_3_1.id,
                type="fill_in_blank",
                prompt="Complete the sentence:",
                content={
                    "sentence_parts": ["I love my ", " very much."],
                    "blank_options": ["family", "shoe", "chair", "pencil"]
                },
                correct_answer="family",
                explanation="'I love my family' expresses affection for relatives.",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson2_3_1.id,
                type="type_answer",
                prompt="Type the word for male sibling:",
                content={
                    "hint": "B-R-O-T-H-E-R"
                },
                correct_answer="Brother",
                explanation="'Brother' is a male sibling.",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson2_3_1.id,
                type="multiple_choice",
                prompt="Your brother and sister are collectively called your:",
                content={
                    "options": [
                        {"id": "1", "text": "Siblings", "image": "👧👦"},
                        {"id": "2", "text": "Teachers", "image": "👩‍🏫"},
                        {"id": "3", "text": "Neighbors", "image": "🏡"}
                    ]
                },
                correct_answer="Siblings",
                explanation="'Siblings' refers to brothers and sisters.",
                order_index=6
            ),
        ]
        db.add_all(ex_2_3_1)

        # =========================================================================
        # UNIT 3: Everyday Sentences & Common Verbs
        # =========================================================================
        print("Seeding Unit 3: Everyday Sentences & Common Verbs...")
        unit3 = Unit(
            course_id=course.id,
            title="Unit 3: Everyday Sentences & Common Verbs",
            description="Express desires, form full sentences with active verbs, and talk about daily routines.",
            order_index=3
        )
        db.add(unit3)
        db.flush()

        # --- Skill 3.1: Common Verbs ---
        skill_verbs = Skill(
            unit_id=unit3.id,
            title="Common Verbs",
            description="Action verbs: speak, learn, eat, drink, and live.",
            icon="compass",
            order_index=1
        )
        db.add(skill_verbs)
        db.flush()

        # Lesson 3.1.1: Essential Actions
        lesson3_1_1 = Lesson(
            skill_id=skill_verbs.id,
            title="Essential Actions",
            order_index=1,
            xp_reward=15
        )
        db.add(lesson3_1_1)
        db.flush()

        ex_3_1_1 = [
            Exercise(
                lesson_id=lesson3_1_1.id,
                type="multiple_choice",
                prompt="Which verb describes communicating through spoken words?",
                content={
                    "options": [
                        {"id": "1", "text": "Speak", "image": "🗣️"},
                        {"id": "2", "text": "Sleep", "image": "😴"},
                        {"id": "3", "text": "Jump", "image": "🦘"}
                    ]
                },
                correct_answer="Speak",
                explanation="'Speak' means to say words and communicate orally.",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson3_1_1.id,
                type="translate_to_target",
                prompt="Assemble the complete sentence:",
                content={
                    "source_sentence": "I speak English every day.",
                    "word_bank": ["I", "speak", "English", "every", "day.", "he", "sleep", "eat"]
                },
                correct_answer=["I", "speak", "English", "every", "day."],
                explanation="'I speak English every day' demonstrates regular active practice.",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson3_1_1.id,
                type="match_pairs",
                prompt="Match active verbs with their synonyms:",
                content={
                    "pairs": [
                        {"left": "Speak", "right": "Talk"},
                        {"left": "Learn", "right": "Study"},
                        {"left": "Eat", "right": "Consume"},
                        {"left": "Drink", "right": "Sip"},
                        {"left": "Live", "right": "Reside"}
                    ]
                },
                correct_answer={"Speak": "Talk", "Learn": "Study", "Eat": "Consume", "Drink": "Sip", "Live": "Reside"},
                explanation="Brilliant pairing of action verbs!",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson3_1_1.id,
                type="fill_in_blank",
                prompt="Complete the sentence:",
                content={
                    "sentence_parts": ["I want to ", " English fluently."],
                    "blank_options": ["learn", "table", "spoon", "sky"]
                },
                correct_answer="learn",
                explanation="'Learn' is the action of acquiring knowledge.",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson3_1_1.id,
                type="type_answer",
                prompt="Type the verb that means 'to talk':",
                content={
                    "hint": "S-P-E-A-K"
                },
                correct_answer="Speak",
                explanation="'Speak' is the foundational verb for talking.",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson3_1_1.id,
                type="multiple_choice",
                prompt="Complete the sentence: 'They _____ in London.'",
                content={
                    "options": [
                        {"id": "1", "text": "live", "image": "🏙️"},
                        {"id": "2", "text": "lives", "image": "🏡"},
                        {"id": "3", "text": "living", "image": "🏗️"}
                    ]
                },
                correct_answer="live",
                explanation="With plural pronoun 'They', use the base form 'live'.",
                order_index=6
            ),
        ]
        db.add_all(ex_3_1_1)

        # Lesson 3.1.2: Actions & Routines
        lesson3_1_2 = Lesson(
            skill_id=skill_verbs.id,
            title="Actions & Routines",
            order_index=2,
            xp_reward=15
        )
        db.add(lesson3_1_2)
        db.flush()

        ex_3_1_2 = [
            Exercise(
                lesson_id=lesson3_1_2.id,
                type="multiple_choice",
                prompt="What action do you perform with a book?",
                content={
                    "options": [
                        {"id": "1", "text": "Read", "image": "📖"},
                        {"id": "2", "text": "Drink", "image": "🥤"},
                        {"id": "3", "text": "Fly", "image": "✈️"}
                    ]
                },
                correct_answer="Read",
                explanation="You 'read' text in a book or screen.",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson3_1_2.id,
                type="translate_to_target",
                prompt="Form the sentence:",
                content={
                    "source_sentence": "I read books in the evening.",
                    "word_bank": ["I", "read", "books", "in", "the", "evening.", "eat", "fast", "morning"]
                },
                correct_answer=["I", "read", "books", "in", "the", "evening."],
                explanation="Sentence describes an evening reading habit.",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson3_1_2.id,
                type="match_pairs",
                prompt="Match verbs with appropriate nouns:",
                content={
                    "pairs": [
                        {"left": "Read", "right": "Books"},
                        {"left": "Write", "right": "Letters"},
                        {"left": "Listen", "right": "Music"},
                        {"left": "Watch", "right": "Movies"},
                        {"left": "Eat", "right": "Dinner"}
                    ]
                },
                correct_answer={"Read": "Books", "Write": "Letters", "Listen": "Music", "Watch": "Movies", "Eat": "Dinner"},
                explanation="Excellent verb-noun associations!",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson3_1_2.id,
                type="fill_in_blank",
                prompt="Complete the sentence:",
                content={
                    "sentence_parts": ["She likes to ", " to music."],
                    "blank_options": ["listen", "eat", "paint", "run"]
                },
                correct_answer="listen",
                explanation="'Listen to music' is the proper English phrase.",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson3_1_2.id,
                type="type_answer",
                prompt="Type the verb for consuming food:",
                content={
                    "hint": "E-A-T"
                },
                correct_answer="Eat",
                explanation="'Eat' is the action of consuming food.",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson3_1_2.id,
                type="multiple_choice",
                prompt="Fill in the blank: 'I _____ English every morning.'",
                content={
                    "options": [
                        {"id": "1", "text": "practice", "image": "🎯"},
                        {"id": "2", "text": "practices", "image": "📝"},
                        {"id": "3", "text": "practicing", "image": "⏳"}
                    ]
                },
                correct_answer="practice",
                explanation="For 'I', use the simple present base form 'practice'.",
                order_index=6
            ),
        ]
        db.add_all(ex_3_1_2)

        # --- Skill 3.2: Daily Life ---
        skill_daily = Skill(
            unit_id=unit3.id,
            title="Daily Life",
            description="Discuss routines, habits, and building learning consistency.",
            icon="star",
            order_index=2
        )
        db.add(skill_daily)
        db.flush()

        # Lesson 3.2.1: My Daily Routine
        lesson3_2_1 = Lesson(
            skill_id=skill_daily.id,
            title="My Daily Routine",
            order_index=1,
            xp_reward=15
        )
        db.add(lesson3_2_1)
        db.flush()

        ex_3_2_1 = [
            Exercise(
                lesson_id=lesson3_2_1.id,
                type="multiple_choice",
                prompt="When do most people wake up for work or school?",
                content={
                    "options": [
                        {"id": "1", "text": "Morning", "image": "🌅"},
                        {"id": "2", "text": "Midnight", "image": "🌌"},
                        {"id": "3", "text": "Noon", "image": "☀️"}
                    ]
                },
                correct_answer="Morning",
                explanation="'Morning' is the start of the waking day.",
                order_index=1
            ),
            Exercise(
                lesson_id=lesson3_2_1.id,
                type="translate_to_target",
                prompt="Assemble the daily habit sentence:",
                content={
                    "source_sentence": "I study English with Duolingo.",
                    "word_bank": ["I", "study", "English", "with", "Duolingo.", "sleep", "never", "car"]
                },
                correct_answer=["I", "study", "English", "with", "Duolingo."],
                explanation="Consistency with Duolingo accelerates fluency!",
                order_index=2
            ),
            Exercise(
                lesson_id=lesson3_2_1.id,
                type="match_pairs",
                prompt="Match daily routine milestones:",
                content={
                    "pairs": [
                        {"left": "Wake up", "right": "Start day"},
                        {"left": "Breakfast", "right": "Morning meal"},
                        {"left": "Work", "right": "Career"},
                        {"left": "Study", "right": "Learn"},
                        {"left": "Sleep", "right": "Rest"}
                    ]
                },
                correct_answer={"Wake up": "Start day", "Breakfast": "Morning meal", "Work": "Career", "Study": "Learn", "Sleep": "Rest"},
                explanation="Terrific job organizing a daily routine!",
                order_index=3
            ),
            Exercise(
                lesson_id=lesson3_2_1.id,
                type="fill_in_blank",
                prompt="Complete the well-known idiom:",
                content={
                    "sentence_parts": ["Practice makes ", "!"],
                    "blank_options": ["perfect", "hungry", "cold", "sleepy"]
                },
                correct_answer="perfect",
                explanation="'Practice makes perfect' reminds learners that repetition leads to mastery.",
                order_index=4
            ),
            Exercise(
                lesson_id=lesson3_2_1.id,
                type="type_answer",
                prompt="Type the global language you are mastering right now:",
                content={
                    "hint": "E-N-G-L-I-S-H"
                },
                correct_answer="English",
                explanation="You are mastering English!",
                order_index=5
            ),
            Exercise(
                lesson_id=lesson3_2_1.id,
                type="multiple_choice",
                prompt="Consistency is the secret to mastering a new:",
                content={
                    "options": [
                        {"id": "1", "text": "Language", "image": "🗣️"},
                        {"id": "2", "text": "Shoe", "image": "👟"},
                        {"id": "3", "text": "Pencil", "image": "✏️"}
                    ]
                },
                correct_answer="Language",
                explanation="Learning a new 'Language' requires daily consistency.",
                order_index=6
            ),
        ]
        db.add_all(ex_3_2_1)

        # =========================================================================
        # SEED DEFAULT LEARNER: Shivam (120 XP, 3-day streak, 5 hearts, 510 gems)
        # =========================================================================
        print("Seeding Badges and Achievements...")
        achievements_data = [
            ("wildfire_streak_3", "Wildfire (3 Days)", "Reach a 3-day learning streak", "flame", 3, 20),
            ("wildfire_streak_7", "Wildfire (7 Days)", "Reach a 7-day learning streak", "flame", 7, 50),
            ("scholar_xp_50", "Scholar (50 XP)", "Earn 50 cumulative experience points", "zap", 50, 20),
            ("scholar_xp_200", "Scholar (200 XP)", "Earn 200 cumulative experience points", "zap", 200, 50),
            ("flawless_victory", "Sharpshooter", "Complete a lesson with 0 mistakes", "target", 1, 20),
            ("gem_collector", "Treasure Hunter", "Accumulate 600 gems", "gem", 600, 50),
        ]
        created_achs = []
        for code, title, desc, icon, req, rew in achievements_data:
            ach = Achievement(code=code, title=title, description=desc, badge_icon=icon, target_value=req, xp_reward=rew)
            db.add(ach)
            created_achs.append(ach)
        db.flush()

        print("Seeding Default Learner 'Shivam'...")
        shivam = User(
            username="Shivam",
            email="shivam@example.com",
            avatar_url="/avatars/shivam.svg"
        )
        db.add(shivam)
        db.flush()

        # User Stats
        stats = UserStats(
            user_id=shivam.id,
            total_xp=120,
            current_hearts=5,
            max_hearts=5,
            streak_count=3,
            last_streak_date=date.today(),
            gems=510
        )
        db.add(stats)

        # Course Progress
        user_prog = UserProgress(
            user_id=shivam.id,
            course_id=course.id,
            completed_lessons_count=3,
            current_lesson_id=lesson1_1_2.id
        )
        db.add(user_prog)

        # Daily Activity
        today = date.today()
        week_start = today - timedelta(days=today.weekday())

        for days_ago, xp, lessons in [(2, 30, 2), (1, 45, 3), (0, 45, 3)]:
            act_date = today - timedelta(days=days_ago)
            db.add(DailyActivity(
                user_id=shivam.id,
                activity_date=act_date,
                xp_earned=xp,
                lessons_completed=lessons,
                daily_goal_xp=50,
                goal_reached=(xp >= 50)
            ))

        # Achievements for Shivam
        for ach in created_achs:
            is_unlocked = False
            curr_prog = 0
            if ach.code == "wildfire_streak_3":
                is_unlocked = True
                curr_prog = 3
            elif ach.code == "wildfire_streak_7":
                curr_prog = 3
            elif ach.code == "scholar_xp_50":
                is_unlocked = True
                curr_prog = 120
            elif ach.code == "scholar_xp_200":
                curr_prog = 120
            elif ach.code == "flawless_victory":
                is_unlocked = True
                curr_prog = 1
            elif ach.code == "gem_collector":
                curr_prog = 510

            ua = UserAchievement(
                user_id=shivam.id,
                achievement_id=ach.id,
                current_progress=curr_prog,
                is_unlocked=is_unlocked,
                unlocked_at=datetime.now(timezone.utc) if is_unlocked else None
            )
            db.add(ua)

        # Shivam in Leaderboard
        shivam_lb = LeaderboardEntry(
            user_id=shivam.id,
            league="Bronze",
            week_start_date=week_start,
            weekly_xp=120
        )
        db.add(shivam_lb)

        # Competitors
        print("Seeding Leaderboard Competitors: Alex, Sarah, Mike, Emma...")
        competitors = [
            ("Alex", "alex@example.com", "/avatars/alex.svg", 840),
            ("Sarah", "sarah@example.com", "/avatars/sarah.svg", 720),
            ("Mike", "mike@example.com", "/avatars/mike.svg", 100),
            ("Emma", "emma@example.com", "/avatars/emma.svg", 80),
        ]

        for username, email, avatar, xp in competitors:
            bot = User(username=username, email=email, avatar_url=avatar)
            db.add(bot)
            db.flush()

            bot_stats = UserStats(
                user_id=bot.id,
                total_xp=xp,
                current_hearts=5,
                streak_count=5 if xp > 500 else 2,
                gems=450
            )
            db.add(bot_stats)

            bot_lb = LeaderboardEntry(
                user_id=bot.id,
                league="Bronze",
                week_start_date=week_start,
                weekly_xp=xp
            )
            db.add(bot_lb)

        db.commit()
        print("Database seeded successfully with English for Beginners Course (3 Units, 8 Skills, 10 Lessons, 60 Exercises), Shivam (120 XP), and Leaderboard Competitors!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
