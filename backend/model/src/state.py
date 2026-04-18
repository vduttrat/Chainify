from typing import List, Dict, Any, TypedDict
from pydantic import BaseModel

class SupplyEvent(BaseModel):
    timestamp: int
    eventType: str
    actorId: str
    locationCode: str
    ipfsDocHash: str

class AnalyzeRequest(BaseModel):
    productId: str
    events: List[SupplyEvent]
    regulatoryJurisdiction: str

class GraphState(BaseModel):
    request: AnalyzeRequest
    fraudScore: int
    fraudFlags: List[Dict[str, Any]]
    complianceViolation: List[Dict[str, Any]]
    narrative: str
