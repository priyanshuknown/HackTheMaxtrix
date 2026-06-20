from pydantic import BaseModel


class FunderResponse(BaseModel):
    id: str
    org_name: str
    funder_type: str
    categories_supported: list[str]
    available_balance: int
    avg_payout_days: float
    model_config = {"from_attributes": True}

class MatchResponse(BaseModel):
    id: str
    request_id: str
    funder_id: str
    funder_name: str
    funder_type: str
    match_score: float
    status: str
    model_config = {"from_attributes": True}

class MatchListResponse(BaseModel):
    request_id: str
    matches: list[MatchResponse]
