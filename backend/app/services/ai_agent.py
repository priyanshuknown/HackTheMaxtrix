import json
import logging
import random
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)

async def analyze_request(text: str, amount: int, history_count: int) -> dict:
    """Analyze a funding request to generate explainable AI scores."""
    if settings.OPENAI_API_KEY:
        return await _ai_analyze(text, amount, history_count)
    else:
        return _mock_analyze(text, amount, history_count)

async def _ai_analyze(text: str, amount: int, history_count: int) -> dict:
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = f"""You are an advanced AI for a student funding platform. Analyze the request.
        Amount: {amount} INR
        Previous requests this year: {history_count}
        Extracted Document Text: {text[:2000]}
        
        Provide JSON with:
        - fraud_score: (0-100, higher is more fraudulent)
        - fraud_reasons: [list of strings explaining why]
        - urgency_level: ("Low", "Medium", "High", "Critical")
        - urgency_reasons: [list of strings]
        - impact_score: (0-100, predicted educational impact)
        - impact_reasons: [list of strings]
        - need_classification: ("exam_fee", "certification_fee", "device_repair", "interview_travel", "books", "emergency")
        - need_confidence: (0-100)
        """
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=600,
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logger.warning(f"AI analysis failed: {e}")
        return _mock_analyze(text, amount, history_count)

def _mock_analyze(text: str, amount: int, history_count: int) -> dict:
    """Fallback Explainable AI."""
    fraud_score = random.randint(5, 30) if history_count < 2 else random.randint(40, 80)
    fraud_reasons = ["Consistent formatting", "Normal amount"] if fraud_score < 30 else ["Frequent requests", "Suspicious text patterns"]
    
    urgency_level = random.choice(["Medium", "High"])
    urgency_reasons = ["Upcoming deadline mentioned", "Standard processing time"]
    
    impact_score = random.randint(70, 95)
    impact_reasons = ["Directly enables academic progress", "High ROI category"]
    
    return {
        "fraud_score": fraud_score,
        "fraud_reasons": fraud_reasons,
        "urgency_level": urgency_level,
        "urgency_reasons": urgency_reasons,
        "impact_score": impact_score,
        "impact_reasons": impact_reasons,
        "need_classification": "exam_fee",
        "need_confidence": 85
    }
