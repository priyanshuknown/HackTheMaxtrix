"""Urgency Engine — rule-based urgency scoring for funding requests.

Combines days-to-deadline and category severity to produce:
- urgency_level: 'High' | 'Medium' | 'Low'
- urgency_score: float 0-100
- review_flag: bool (flags students with existing request history for manual review)
"""

from datetime import date


# Category severity weights — exam deadlines and interviews are most time-critical
CATEGORY_SEVERITY = {
    "exam_fee": 1.0,
    "interview_travel": 0.9,
    "certification_fee": 0.7,
    "device_repair": 0.6,
}


def calculate_urgency(
    deadline_date: date,
    amount: int,
    category: str,
    existing_request_count: int,
) -> dict:
    """Calculate urgency score for a funding request.

    Args:
        deadline_date: When the student needs the funds by
        amount: Requested amount in INR
        category: One of the 4 fixed categories
        existing_request_count: How many requests this student already has this year

    Returns:
        dict with urgency_level, urgency_score, review_flag
    """
    days_remaining = (deadline_date - date.today()).days

    # Time urgency: 0-100, higher = more urgent (fewer days remaining)
    if days_remaining <= 0:
        time_score = 100.0
    elif days_remaining <= 3:
        time_score = 95.0
    elif days_remaining <= 7:
        time_score = 80.0
    elif days_remaining <= 14:
        time_score = 60.0
    elif days_remaining <= 30:
        time_score = 40.0
    else:
        time_score = max(0, 100 - (days_remaining * 2))

    # Category severity score
    severity_score = CATEGORY_SEVERITY.get(category, 0.5) * 100

    # Amount factor: higher amounts get slight urgency bump (caps at 25k)
    amount_factor = min(amount / 25000, 1.0) * 20  # max 20 points

    # Composite urgency score (weighted)
    urgency_score = (time_score * 0.50) + (severity_score * 0.35) + (amount_factor * 0.15)
    urgency_score = round(min(urgency_score, 100), 1)

    # Determine level
    if urgency_score >= 70:
        level = "High"
    elif urgency_score >= 40:
        level = "Medium"
    else:
        level = "Low"

    # Review flag: any student who already has a prior request this year
    # gets flagged for manual review (pattern detection, not auto-rejection)
    review_flag = existing_request_count >= 1

    return {
        "urgency_level": level,
        "urgency_score": urgency_score,
        "review_flag": review_flag,
    }
