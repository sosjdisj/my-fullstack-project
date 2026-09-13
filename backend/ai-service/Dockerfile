# AI 服务（FastAPI + LangChain + sentence-transformers）
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# 先装 CPU 版 torch（比 PyPI 默认 CUDA 版小很多），sentence-transformers 会复用
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
# 模型文件经 HF_HOME 挂载持久化，首次启动自动下载 reranker 模型
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
