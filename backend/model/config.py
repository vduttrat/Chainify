from __future__ import annotations
from functools import lru_cache
from os import getenv
from dotenv import load_dotenv
load_dotenv()

class Settings:
    def __init__(self) -> None:
        self.huggingface_api_token = getenv("HUGGINGFACE_API_TOKEN", "").strip()
        self.embedding_model = getenv("EMBEDDING_MODEL", default="sentence-transformers/all-MiniLM-L6-v2").strip()
        self.llm_model = getenv("LLM_MODEL", default="openai/gpt-oss-120b").strip()
        # self.rag_score_threshold = float(getenv("RAG_SCORE_THRESHOLD", "0.0"))
        # self.log_level = getenv("LOG_LEVEL", "INFO").strip().upper()
        # self.debug = getenv("DEBUG", "False").strip().lower() in {"1", "true", "yes", "on"}
        # self.port = int(getenv("PORT", "8000"))
        # self.host = getenv("HOST", "0.0.0.0").strip()

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
