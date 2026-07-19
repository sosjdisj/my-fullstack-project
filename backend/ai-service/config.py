import os

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "qwen3:8b")
OLLAMA_EMBEDDING_MODEL = os.getenv("OLLAMA_EMBEDDING_MODEL", "embeddinggemma:300m")

RERANKER_MODEL = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "article_chunks")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/myblog")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

JAVA_BACKEND_URL = os.getenv("JAVA_BACKEND_URL", "http://localhost:3001")

EMBEDDING_CACHE_TTL = int(os.getenv("EMBEDDING_CACHE_TTL", "86400"))  # 24 hours
RAG_CACHE_TTL = int(os.getenv("RAG_CACHE_TTL", "3600"))  # 1 hour

CHUNK_WINDOW_SIZE = int(os.getenv("CHUNK_WINDOW_SIZE", "512"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))
