from dataclasses import dataclass

@dataclass
class InferResult:
    output: dict
    model_version: str
    confidence: float
    latency_ms: int
    cost_usd: float
    reason: str

class ModelGateway:
    """تمام مدلها پشت یک gateway: cost tracking، fallback، versioning."""

    async def infer(self, task: str, payload: dict, *, prefer: str | None = None) -> InferResult:
        # 1) selection مدل بر اساس task + policy
        # 2) fallback زنجیرهای: primary -> secondary -> rule-based
        # 3) ثبت ai.model_calls (latency, cost, confidence, version)
        # 4) include reason + version در خروجی
        raise NotImplementedError

    def _policy(self, task: str) -> list[str]:
        return {
            "pricing": ["lgbm-2026.11", "rules-v3"],
            "ocr": ["paddleocr-v4", "rules-v3"],
            "chat": ["gpt-4o", "llama-3.1", "canned-v1"],
            "recommend": ["two-tower-v2", "popularity-v1"],
        }.get(task, ["rules-v3"])
