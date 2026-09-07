from fastapi.testclient import TestClient
from app.main import app
from app.seed.seed_data import seed_database

# Reset DB with fresh seeds before running tests
seed_database()

client = TestClient(app)


def test_api_suite():
    print("\n=======================================================")
    print("      DUOLINGO BACKEND FULL API TEST SUITE")
    print("=======================================================")

    # 1. Health check
    print("\n--- 1. Health Endpoint ---")
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    print("PASS: /api/health ->", res.json())

    # 2. GET /api/course
    print("\n--- 2. GET /api/course ---")
    res = client.get("/api/course")
    assert res.status_code == 200, res.text
    course = res.json()
    assert course["title"] == "Spanish for English Speakers"
    assert course["total_units"] == 3
    assert course["total_skills"] >= 6
    assert course["total_lessons"] >= 10
    print(f"PASS: /api/course -> Course: '{course['title']}', Units: {course['total_units']}, Lessons: {course['total_lessons']}")

    # 3. GET /api/units
    print("\n--- 3. GET /api/units ---")
    res = client.get("/api/units")
    assert res.status_code == 200, res.text
    units = res.json()
    assert len(units) == 3
    unit1, unit2, unit3 = units[0], units[1], units[2]
    print(f"PASS: /api/units -> {len(units)} units found:")
    print(f"   Unit 1: '{unit1['title']}' ({len(unit1['skills'])} skills)")
    print(f"   Unit 2: '{unit2['title']}' ({len(unit2['skills'])} skills)")
    print(f"   Unit 3: '{unit3['title']}' ({len(unit3['skills'])} skills)")

    # 4. GET /api/skills & GET /api/skills/{id}
    print("\n--- 4. GET /api/skills and /api/skills/{id} ---")
    res = client.get("/api/skills")
    assert res.status_code == 200, res.text
    skills = res.json()
    assert len(skills) >= 7
    first_skill = skills[0]
    print(f"PASS: /api/skills -> {len(skills)} skills returned. First skill: '{first_skill['title']}' (status: {first_skill['status']})")

    res = client.get(f"/api/skills/{first_skill['id']}")
    assert res.status_code == 200, res.text
    skill_detail = res.json()
    assert len(skill_detail["lessons"]) >= 1
    print(f"PASS: /api/skills/{first_skill['id']} -> Skill: '{skill_detail['title']}', Lessons: {len(skill_detail['lessons'])}")

    # 5. GET /api/lessons/{id}
    print("\n--- 5. GET /api/lessons/{id} ---")
    lesson_id = skill_detail["lessons"][0]["id"]
    res = client.get(f"/api/lessons/{lesson_id}")
    assert res.status_code == 200, res.text
    lesson_data = res.json()
    assert len(lesson_data["exercises"]) >= 5
    print(f"PASS: /api/lessons/{lesson_id} -> Title: '{lesson_data['title']}', Exercises count: {len(lesson_data['exercises'])}")

    # 6. POST /api/lessons/{id}/start
    print("\n--- 6. POST /api/lessons/{id}/start ---")
    res = client.post(f"/api/lessons/{lesson_id}/start")
    assert res.status_code == 200, res.text
    start_data = res.json()
    attempt_id = start_data["attempt_id"]
    exercises = start_data["exercises"]
    print(f"PASS: /api/lessons/{lesson_id}/start -> Attempt ID: {attempt_id}, Active Hearts: {start_data['hearts_remaining']}")

    # 7. POST /api/exercises/{id}/answer (Mistake deduction & Correct answering)
    print("\n--- 7. POST /api/exercises/{id}/answer ---")
    ex1 = exercises[0]
    # Wrong answer -> deduct 1 heart (5 -> 4)
    res = client.post(f"/api/exercises/{ex1['id']}/answer", json={"user_answer": "Wrong answer", "attempt_id": attempt_id})
    assert res.status_code == 200, res.text
    ans_wrong = res.json()
    assert ans_wrong["is_correct"] is False
    assert ans_wrong["hearts_remaining"] == 4
    print(f"PASS: Mistake handled cleanly -> Correct: {ans_wrong['is_correct']}, Hearts remaining: {ans_wrong['hearts_remaining']}")

    # Correct answers for all 6 exercises
    correct_submissions = [
        (exercises[0]["id"], "Hola"),
        (exercises[1]["id"], ["Buenos", "días", "¿cómo", "estás?"]),
        (exercises[2]["id"], ["Goodbye,", "see", "you", "later"]),
        (exercises[3]["id"], {"Hola": "Hello", "Adiós": "Goodbye", "Gracias": "Thank you", "Por favor": "Please", "Sí": "Yes"}),
        (exercises[4]["id"], "tardes"),
        (exercises[5]["id"], "Adiós")
    ]

    for ex_id, correct_ans in correct_submissions:
        res = client.post(f"/api/exercises/{ex_id}/answer", json={"user_answer": correct_ans, "attempt_id": attempt_id})
        assert res.status_code == 200, res.text
        assert res.json()["is_correct"] is True

    print(f"PASS: All {len(correct_submissions)} exercise types answered correctly with remaining hearts: {res.json()['hearts_remaining']}")

    # 8. POST /api/lessons/{id}/complete
    print("\n--- 8. POST /api/lessons/{id}/complete ---")
    res = client.post(f"/api/lessons/{lesson_id}/complete", json={"attempt_id": attempt_id})
    assert res.status_code == 200, res.text
    comp = res.json()
    assert comp["status"] == "completed"
    assert comp["xp_earned"] == 15
    print(f"PASS: /api/lessons/{lesson_id}/complete -> Status: {comp['status']}, XP Earned: {comp['xp_earned']}, Total XP: {comp['total_xp']}, Streak: {comp['streak_count']}")

    # 9. GET /api/users/me
    print("\n--- 9. GET /api/users/me ---")
    res = client.get("/api/users/me")
    assert res.status_code == 200, res.text
    me = res.json()
    assert me["username"] == "Shivam"
    print(f"PASS: /api/users/me -> Username: {me['username']}, Email: {me['email']}")

    # 10. GET /api/users/me/progress
    print("\n--- 10. GET /api/users/me/progress ---")
    res = client.get("/api/users/me/progress")
    assert res.status_code == 200, res.text
    prog = res.json()
    assert prog["course_title"] == "Spanish for English Speakers"
    print(f"PASS: /api/users/me/progress -> Course: '{prog['course_title']}', Completed: {prog['completed_lessons_count']}/{prog['total_lessons_count']} ({prog['completion_percentage']}%)")

    # 11. GET /api/users/me/stats
    print("\n--- 11. GET /api/users/me/stats ---")
    res = client.get("/api/users/me/stats")
    assert res.status_code == 200, res.text
    stats = res.json()
    assert stats["total_xp"] >= 120
    assert stats["streak_count"] >= 3
    assert stats["gems"] >= 500
    print(f"PASS: /api/users/me/stats -> Total XP: {stats['total_xp']}, Streak: {stats['streak_count']}, Hearts: {stats['current_hearts']}/5, Gems: {stats['gems']}")

    # 12. POST /api/users/me/practice
    print("\n--- 12. POST /api/users/me/practice ---")
    res = client.post("/api/users/me/practice")
    assert res.status_code == 200, res.text
    practice = res.json()
    assert practice["xp_earned"] == 10
    print(f"PASS: /api/users/me/practice -> Message: '{practice['message']}', Current Hearts: {practice['current_hearts']}, Total XP: {practice['total_xp']}")

    # 13. POST /api/users/me/refill-hearts
    print("\n--- 13. POST /api/users/me/refill-hearts ---")
    res = client.post("/api/users/me/refill-hearts?method=practice")
    assert res.status_code == 200, res.text
    refill = res.json()
    assert refill["current_hearts"] == 5
    print(f"PASS: /api/users/me/refill-hearts -> Hearts: {refill['current_hearts']}/5, Gems: {refill['gems']}")

    # 14. GET /api/leaderboard
    print("\n--- 14. GET /api/leaderboard ---")
    res = client.get("/api/leaderboard")
    assert res.status_code == 200, res.text
    lb = res.json()
    assert len(lb["entries"]) >= 5
    print(f"PASS: /api/leaderboard -> League: {lb['league']}, Total ranked users: {len(lb['entries'])}")
    for entry in lb["entries"][:5]:
        flag = " [CURRENT USER]" if entry["is_current_user"] else ""
        print(f"   #{entry['rank']}: {entry['username']} - {entry['weekly_xp']} XP{flag}")

    # 15. GET /api/achievements
    print("\n--- 15. GET /api/achievements ---")
    res = client.get("/api/achievements")
    assert res.status_code == 200, res.text
    ach = res.json()
    assert ach["total_count"] >= 6
    print(f"PASS: /api/achievements -> Unlocked: {ach['unlocked_count']}/{ach['total_count']}")
    for a in ach["achievements"]:
        status_str = "UNLOCKED" if a["is_unlocked"] else f"{a['current_progress']}/{a['target_value']}"
        print(f"   [{status_str}] {a['title']}: {a['description']}")

    # 16. Error Handling Tests (404, 400, no stack trace)
    print("\n--- 16. Error Handling Tests ---")
    res404 = client.get("/api/lessons/99999")
    assert res404.status_code == 404
    assert "detail" in res404.json()
    assert "Traceback" not in res404.text
    print("PASS: 404 Not Found cleanly handled:", res404.json())

    res400 = client.post("/api/exercises/1/answer", json={"bad_field": 123})
    assert res400.status_code == 400
    assert "detail" in res400.json()
    assert "Traceback" not in res400.text
    print("PASS: 400 Bad Request / Validation cleanly handled:", res400.json())

    print("\n=======================================================")
    print("  ALL 16 ENDPOINT & ERROR TESTS PASSED WITH 100% SUCCESS!")
    print("=======================================================\n")


if __name__ == "__main__":
    test_api_suite()
