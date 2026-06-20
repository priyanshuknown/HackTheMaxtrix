"""Matching Engine — ranks institutional funders for a verified request.

Scores funders based on:
- Category fit (does the funder support this category?)
- Available balance (can they cover the amount?)
- Historical payout speed (faster = better)
"""


def match_funders(request_category: str, request_amount: int, funders: list) -> list:
    """Rank funders by match score for a given request.

    Args:
        request_category: The request's category (e.g., 'exam_fee')
        request_amount: Requested amount in INR
        funders: List of funder objects/dicts with categories_supported,
                 available_balance, avg_payout_days

    Returns:
        Sorted list of {funder_id, org_name, funder_type, match_score, available_balance}
    """
    ranked = []

    for funder in funders:
        # Extract funder attributes (handle both ORM objects and dicts)
        if hasattr(funder, "categories_supported"):
            cats = funder.categories_supported
            balance = funder.available_balance
            speed = funder.avg_payout_days
            funder_id = str(funder.id)
            org_name = funder.org_name
            funder_type = funder.funder_type
        else:
            cats = funder.get("categories_supported", [])
            balance = funder.get("available_balance", 0)
            speed = funder.get("avg_payout_days", 3.0)
            funder_id = str(funder.get("id", ""))
            org_name = funder.get("org_name", "")
            funder_type = funder.get("funder_type", "")

        # 1. Category fit (binary gate — must support the category)
        category_fit = 1.0 if request_category in cats else 0.0
        if category_fit == 0:
            continue  # Skip funders that don't support this category

        # 2. Balance ratio — can they cover the full amount?
        if balance <= 0:
            continue  # Skip funders with no balance
        balance_ratio = min(balance / request_amount, 1.0)

        # 3. Speed score — faster payout is better (inverse of days, normalized to 30)
        speed_score = max(0, 1.0 - (speed / 30.0))

        # 4. Surplus capacity — funders with more surplus get slight preference
        surplus = max(0, (balance - request_amount) / balance) if balance > 0 else 0

        # Composite match score
        match_score = (
            (category_fit * 0.40)
            + (balance_ratio * 0.30)
            + (speed_score * 0.20)
            + (surplus * 0.10)
        )
        match_score = round(match_score, 3)

        ranked.append({
            "funder_id": funder_id,
            "org_name": org_name,
            "funder_type": funder_type,
            "match_score": match_score,
            "available_balance": balance,
        })

    # Sort by match score descending
    ranked.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked
