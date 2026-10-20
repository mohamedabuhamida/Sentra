from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    prompt: str = Field(..., description="Inbound client user prompt")
    conversation_id: Optional[str] = Field(None, description="Session / conversation identifier")
    preferred_model: Optional[str] = Field(None, description="Explicit provider or model override if allowed")
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(1000, ge=1, le=8192)
    routing_strategy: Optional[str] = Field("multi-objective", description="multi-objective | cost | quality | latency")

class SecurityCheckResult(BaseModel):
    is_safe: bool
    risk_score: float
    confidence: float
    attack_type: Optional[str] = None
    action: str  # ALLOW, BLOCK, SANITIZE
    latency_ms: float

class AnalysisResult(BaseModel):
    task_type: str
    complexity: str  # Low, Medium, High
    estimated_prompt_tokens: int
    language: str
    requires_long_context: bool

class TokenUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatResponse(BaseModel):
    request_id: str
    response_text: str
    model_used: str
    provider: str
    latency_ms: float
    tokens: TokenUsage
    cost_usd: float
    cached: bool
    security: SecurityCheckResult
    analysis: AnalysisResult
