import os

from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

# 对话模型（OpenAI 兼容协议，默认 DeepSeek）
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.deepseek.com/v1")
# 密钥为空时用占位值，避免 OpenAI SDK 在启动阶段直接报错
LLM_API_KEY = os.getenv("LLM_API_KEY", "") or "not-needed"
LLM_CHAT_MODEL = os.getenv("LLM_CHAT_MODEL", "deepseek-flash")


def _get_or(key: str, fallback: str) -> str:
    """读取环境变量，空值（未设置或空串）时回退到 fallback"""
    return os.getenv(key) or fallback


# Embedding 模型（本地 sentence-transformers 加载，进程内 CPU 推理，无需外部服务）
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "google/embeddinggemma-300m")

RERANKER_MODEL = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
# 空值时置 None，避免 qdrant-client 发送空的认证头
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY") or None
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "article_chunks")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/myblog")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

JAVA_BACKEND_URL = os.getenv("JAVA_BACKEND_URL", "http://localhost:3001")

EMBEDDING_CACHE_TTL = int(os.getenv("EMBEDDING_CACHE_TTL", "86400"))  # 24 hours
RAG_CACHE_TTL = int(os.getenv("RAG_CACHE_TTL", "3600"))  # 1 hour

CHUNK_WINDOW_SIZE = int(os.getenv("CHUNK_WINDOW_SIZE", "512"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))

# 工具调用 Java 后端的 HTTP 超时（秒），防止后端卡住拖垮整个 Agent
HTTP_TIMEOUT = float(os.getenv("HTTP_TIMEOUT", "10.0"))
