from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    event_description: str
    event_category: Optional[str] = None

class EvaluationResult(BaseModel):
    analysis_scratchpad: str = Field(description="Step-by-step comparison. Quote the exact retrieved law first, then analyze how the event compares to that quote.")
    fraud_probability_score: int = Field(description="Score from a 0 to 100 indicating fraud/tampering likelihood")
    is_law_flagged: bool = Field(description="True if event violates retrieved regulations, False otherwise")
    compliance_reasoning: str = Field(description="Explanation of legal flag and fraud score")

class GraphState(BaseModel):
    request: AnalyzeRequest
    legal_search_query: str = ""
    web_search_query: str = ""
    web_results: str = ""
    retrieved_regulations: List[str] = []
    evaluation: Optional[EvaluationResult] = None
