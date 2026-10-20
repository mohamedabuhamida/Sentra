import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class RequestLog(Base):
    __tablename__ = "request_logs"

    id = Column(String(64), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    prompt_snippet = Column(Text, nullable=False)
    task_type = Column(String(64), index=True)
    selected_model = Column(String(64), index=True)
    provider = Column(String(64))
    status = Column(String(32), index=True)  # SUCCESS, BLOCKED, FALLBACK, CACHED
    latency_ms = Column(Float)
    prompt_tokens = Column(Integer)
    completion_tokens = Column(Integer)
    total_tokens = Column(Integer)
    cost_usd = Column(Float)
    cache_hit = Column(Boolean, default=False)
    risk_score = Column(Float)
    action_taken = Column(String(32))

class SecurityIncident(Base):
    __tablename__ = "security_incidents"

    id = Column(String(64), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    attack_type = Column(String(64), index=True)
    risk_score = Column(Float)
    matched_rule = Column(String(128))
    client_ip = Column(String(45))
    malicious_snippet = Column(Text)
    action_taken = Column(String(32))  # BLOCK, SANITIZE

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    hashed_key = Column(String(256), nullable=False, unique=True)
    prefix = Column(String(32), nullable=False)
    scope = Column(String(64), default="read_write")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_used = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
