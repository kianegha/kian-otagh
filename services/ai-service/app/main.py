from fastapi import FastAPI, UploadFile
from pydantic import BaseModel

app = FastAPI(title="Kian AI", version="1.0")

class PricingIn(BaseModel):
    listing_id: str
    features: dict

class ChatIn(BaseModel):
    message: str
    reservation_id: str | None = None
    locale: str = "fa"

class RecoIn(BaseModel):
    guest_id: str
    lat: float | None = None
    lon: float | None = None

@app.post("/v1/pricing/suggest")
async def suggest_price(payload: PricingIn):
    # features -> LightGBM -> guardrails -> ai.pricing_runs
    return {"suggested": 820000, "floor": 700000, "ceiling": 1200000,
            "confidence": 0.91, "reason": "high demand · weekend · 12d lead",
            "model_version": "lgbm-2026.11"}

@app.post("/v1/documents/verify")
async def verify_doc(file: UploadFile):
    # OCR -> extraction -> checks -> decision + retry instruction (بدون انسان)
    return {"decision": "retry", "confidence": 0.72,
            "message": "لطفاً عکس واضحتر بفرستید", "attempt": 2}

@app.post("/v1/chat")
async def chat(msg: ChatIn):
    # RAG + tool calling + escalation flag
    return {"answer": "...", "intent": "change_date", "escalate": False}

@app.post("/v1/recommend")
async def recommend(ctx: RecoIn):
    # two-tower + pgvector HNSW + ranker + diversity
    return {"listing_ids": ["..."], "scores": [0.98, 0.94]}
