"""Unit tests for streak computation logic."""
from datetime import date, timedelta
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.lesson_engine_service import compute_streak


def test_first_ever_activity():
    """No prior streak date -> streak becomes 1."""
    streak, last_date = compute_streak(0, None, date(2024, 1, 10))
    assert streak == 1
    assert last_date == date(2024, 1, 10)
    print("PASS: first_ever_activity -> streak=1")


def test_same_day_does_not_double_count():
    """Completing a 2nd lesson on the same day should not increment streak."""
    today = date(2024, 1, 10)
    streak, last_date = compute_streak(3, today, today)
    assert streak == 3, f"Expected 3, got {streak}"
    assert last_date == today
    print("PASS: same_day_idempotent -> streak unchanged at 3")


def test_yesterday_increments_streak():
    """Last activity yesterday -> streak +1."""
    yesterday = date(2024, 1, 9)
    today = date(2024, 1, 10)
    streak, last_date = compute_streak(5, yesterday, today)
    assert streak == 6, f"Expected 6, got {streak}"
    assert last_date == today
    print("PASS: yesterday_increments -> streak 5->6")


def test_gap_one_day_resets():
    """Activity 2 days ago (gap > 1) -> streak resets to 1."""
    two_days_ago = date(2024, 1, 8)
    today = date(2024, 1, 10)
    streak, last_date = compute_streak(10, two_days_ago, today)
    assert streak == 1, f"Expected 1, got {streak}"
    assert last_date == today
    print("PASS: gap_resets -> streak 10->1")


def test_large_gap_resets():
    """Activity a week ago -> streak resets to 1."""
    week_ago = date(2024, 1, 3)
    today = date(2024, 1, 10)
    streak, last_date = compute_streak(25, week_ago, today)
    assert streak == 1, f"Expected 1, got {streak}"
    print("PASS: large_gap_resets -> streak 25->1")


def test_consecutive_days_build_streak():
    """Simulate 5 consecutive days."""
    base = date(2024, 1, 5)
    streak = 0
    last_date = None
    for i in range(5):
        today = base + timedelta(days=i)
        streak, last_date = compute_streak(streak, last_date, today)

    assert streak == 5, f"Expected 5, got {streak}"
    print("PASS: five_consecutive_days -> streak=5")


def test_streak_broken_then_resumed():
    """Build 3-day streak, skip 2 days, then resume -> resets to 1."""
    today = date(2024, 1, 10)

    # Simulate streak of 3
    s, d = compute_streak(0, None, today - timedelta(days=5))
    s, d = compute_streak(s, d, today - timedelta(days=4))
    s, d = compute_streak(s, d, today - timedelta(days=3))
    assert s == 3

    # Skip days 2024-01-08 and 2024-01-09 (gap of 2 days)
    s, d = compute_streak(s, d, today)
    assert s == 1, f"Expected 1, got {s}"
    print("PASS: broken_streak_resets -> streak 3->1 after gap")


if __name__ == "__main__":
    test_first_ever_activity()
    test_same_day_does_not_double_count()
    test_yesterday_increments_streak()
    test_gap_one_day_resets()
    test_large_gap_resets()
    test_consecutive_days_build_streak()
    test_streak_broken_then_resumed()
    print("\n=================================")
    print("ALL STREAK TESTS PASSED [OK]")
    print("=================================")
