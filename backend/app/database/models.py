import uuid
import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class RequestLog(Base):
    __tablename__ = "request_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, index=True)
    prompt_snippet = Column(Text, nullable=False)
    task_type = Column(String(64), index=True)
    model_used = Column(String(64), index=True)
    status = Column(String(32), index=True)  # success, blocked, fallback, cached, error
    latency_ms = Column(Float)
    prompt_tokens = Column(Integer)
    completion_tokens = Column(Integer)
    total_tokens = Column(Integer)
    cost_usd = Column(Float)
    cache_hit = Column(Boolean, default=False)
    risk_score = Column(Float)
    action_taken = Column(String(32))  # allow, block, sanitize

    @property
    def selected_model(self):
        return self.model_used

    def to_dict(self):
        return {
            "id": str(self.id),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "prompt_snippet": self.prompt_snippet,
            "task_type": self.task_type,
            "selected_model": self.model_used,
            "provider": "gateway",
            "status": self.status.upper() if self.status else "SUCCESS",
            "latency_ms": self.latency_ms,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
            "cost_usd": self.cost_usd,
            "cache_hit": self.cache_hit,
            "risk_score": self.risk_score,
            "action_taken": self.action_taken.upper() if self.action_taken else "ALLOW",
        }

class SecurityIncident(Base):
    __tablename__ = "security_incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, index=True)
    attack_type = Column(String(64), index=True)
    severity = Column(String(32), default="medium")
    risk_score = Column(Float, nullable=False)
    confidence = Column(Float, default=0.95, nullable=False)
    matched_rule = Column(String(128))
    client_ip = Column(String(45))
    malicious_snippet = Column(Text)
    action_taken = Column(String(32), nullable=False)  # block, sanitize, flag, allow

    def to_dict(self):
        return {
            "id": str(self.id),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "attack_type": self.attack_type,
            "risk_score": self.risk_score,
            "confidence": self.confidence,
            "matched_rule": self.matched_rule,
            "client_ip": self.client_ip,
            "malicious_snippet": self.malicious_snippet,
            "action_taken": self.action_taken.upper() if self.action_taken else "BLOCK",
        }

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(128), nullable=False)
    key_prefix = Column(String(32), nullable=False)
    hashed_key = Column(String(256), nullable=False, unique=True)
    scope = Column(String(64), default="read_write")
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "prefix": self.key_prefix,
            "scope": self.scope,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_used": self.last_used_at.isoformat() if self.last_used_at else None,
            "is_active": self.is_active,
        }
