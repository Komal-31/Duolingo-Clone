import json
import urllib.request
import urllib.error

BASE = 'http://127.0.0.1:8000/api'

def get_json(url):
    req = urllib.request.Request(url, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def post_json(url, data=None):
    payload = json.dumps(data or {}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def run():
    print("=== 1. Checking Initial User Stats ===")
    initial_stats = get_json(f"{BASE}/users/me/stats")
    print(f"Initial XP: {initial_stats['total_xp']}, Hearts: {initial_stats['current_hearts']}, Streak: {initial_stats['streak_count']}")

    print("\n=== 2. Starting Lesson 1 ===")
    start_data = post_json(f"{BASE}/lessons/1/start?user_id=1")
    attempt_id = start_data["attempt_id"]
    exercises = start_data["exercises"]
    print(f"Attempt ID: {attempt_id}, Exercises: {len(exercises)}, Hearts: {start_data['hearts_remaining']}")
    types = [ex["type"] for ex in exercises]
    print("Exercise types in Lesson 1:", types)
    assert "multiple_choice" in types
    assert "translate_to_target" in types or "translate_to_source" in types
    assert "match_pairs" in types
    assert "fill_in_blank" in types
    assert "type_answer" in types

    print("\n=== 3. Answering Exercise 1 CORRECTLY ===")
    ex1 = exercises[0]
    ans1 = post_json(f"{BASE}/exercises/{ex1['id']}/answer?user_id=1", {"user_answer": "Hola", "attempt_id": attempt_id})
    print(f"Correct: {ans1['is_correct']}, Hearts: {ans1['hearts_remaining']}")
    assert ans1["is_correct"] is True
    assert ans1["hearts_remaining"] == 5

    print("\n=== 4. Answering Exercise 2 INCORRECTLY ===")
    ex2 = exercises[1]
    ans2 = post_json(f"{BASE}/exercises/{ex2['id']}/answer?user_id=1", {"user_answer": "Wrong Answer", "attempt_id": attempt_id})
    print(f"Correct: {ans2['is_correct']}, Hearts: {ans2['hearts_remaining']}, Explanation: {ans2['explanation']}")
    assert ans2["is_correct"] is False
    assert ans2["hearts_remaining"] == 4

    print("\n=== 5. Losing All Hearts (Triggering 0 Hearts / Failed State) ===")
    for i in range(4):
        res = post_json(f"{BASE}/exercises/{ex2['id']}/answer?user_id=1", {"user_answer": "Wrong Answer", "attempt_id": attempt_id})
        h = res["hearts_remaining"]
        print(f"Mistake {i+2}: Hearts remaining = {h}")

    final_ans = post_json(f"{BASE}/exercises/{ex2['id']}/answer?user_id=1", {"user_answer": "Wrong Answer", "attempt_id": attempt_id})
    print(f"Hearts remaining after depletion: {final_ans['hearts_remaining']}, Failed: {final_ans['is_failed']}")
    assert final_ans["hearts_remaining"] == 0
    assert final_ans["is_failed"] is True

    print("\n=== 6. Testing Practice & Refill via API ===")
    practice_res = post_json(f"{BASE}/users/me/practice?user_id=1")
    print("Practice session recovered hearts:", practice_res["current_hearts"])
    assert practice_res["current_hearts"] >= 1

    refill_res = post_json(f"{BASE}/users/me/refill-hearts?user_id=1&method=gems")
    print("Instant refill restored hearts:", refill_res["current_hearts"])
    assert refill_res["current_hearts"] == 5

    print("\n=== 7. Completing a Full Lesson ===")
    start2 = post_json(f"{BASE}/lessons/1/start?user_id=1")
    att2 = start2["attempt_id"]
    exs2 = start2["exercises"]

    # Answer all 6 correctly
    post_json(f"{BASE}/exercises/{exs2[0]['id']}/answer?user_id=1", {"user_answer": "Hola", "attempt_id": att2})
    post_json(f"{BASE}/exercises/{exs2[1]['id']}/answer?user_id=1", {"user_answer": ["Buenos", "días", "¿cómo", "estás?"], "attempt_id": att2})
    post_json(f"{BASE}/exercises/{exs2[2]['id']}/answer?user_id=1", {"user_answer": ["Goodbye,", "see", "you", "later"], "attempt_id": att2})
    post_json(f"{BASE}/exercises/{exs2[3]['id']}/answer?user_id=1", {"user_answer": {"Hola": "Hello", "Adiós": "Goodbye", "Gracias": "Thank you", "Por favor": "Please", "Sí": "Yes"}, "attempt_id": att2})
    post_json(f"{BASE}/exercises/{exs2[4]['id']}/answer?user_id=1", {"user_answer": "tardes", "attempt_id": att2})
    post_json(f"{BASE}/exercises/{exs2[5]['id']}/answer?user_id=1", {"user_answer": "Adiós", "attempt_id": att2})

    comp_data = post_json(f"{BASE}/lessons/1/complete?user_id=1", {"attempt_id": att2})
    print(f"Lesson complete response: status={comp_data['status']}, xp_earned={comp_data['xp_earned']}, total_xp={comp_data['total_xp']}, streak={comp_data['streak_count']}")

    print("\n=== 8. Verifying SQLite Persistence ===")
    new_stats = get_json(f"{BASE}/users/me/stats")
    print(f"Initial XP: {initial_stats['total_xp']} -> New Persisted XP: {new_stats['total_xp']}")
    assert new_stats["total_xp"] > initial_stats["total_xp"], "XP did not increase!"
    print("\nSUCCESS! All 8 verification steps passed cleanly!")

if __name__ == "__main__":
    run()
