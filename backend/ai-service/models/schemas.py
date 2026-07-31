import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    conversation_id: str = Field(..., min_length=1, max_length=50, description="对话ID")
    message: str = Field(..., min_length=1, max_length=5000, description="用户消息")
    user_id: int = Field(..., gt=0, description="用户ID")
    token: str = Field(default="", max_length=1000, description="JWT Token")

    @field_validator('message')
    @classmethod
    def message_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('消息内容不能为空')
        return v.strip()


class ChatResponse(BaseModel):
    conversation_id: str
    reply: str
    sources: list[dict] = []


class Conversation(BaseModel):
    id: str
    user_id: int = Field(..., gt=0)
    title: str = Field(default="新对话", max_length=100)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class Message(BaseModel):
    id: Optional[str] = None
    conversation_id: str = Field(..., min_length=1)
    role: str = Field(..., pattern=r'^(user|assistant|system)$')
    content: str = Field(..., min_length=1)
    created_at: Optional[datetime] = None

    @field_validator('content')
    @classmethod
    def content_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('消息内容不能为空')
        return v


class HistoryResponse(BaseModel):
    messages: list[Message]
    next_cursor: Optional[str] = None
    has_more: bool = False


class KnowledgeRebuildResponse(BaseModel):
    success: bool
    message: str
    chunks_count: int = Field(ge=0)


class RAGContext(BaseModel):
    context: str
    sources: list[dict] = []


class EmbeddingResponse(BaseModel):
    vector: list[float]
    cached: bool = False


# ===== 请求参数验证 =====

class PageQuery(BaseModel):
    page: int = Field(default=1, ge=1, description="页码")
    size: int = Field(default=10, ge=1, le=50, description="每页数量")


class ContentQuery(PageQuery):
    content: str = Field(..., min_length=1, max_length=100, description="内容关键词")


class KeywordQuery(PageQuery):
    keyword: str = Field(default="", max_length=50, description="搜索关键词")


class PlaylistQuery(BaseModel):
    mode: str = Field(default="normal", pattern=r'^(daily|normal)$')
    limit: int = Field(default=6, ge=1, le=20)


class ChartsQuery(BaseModel):
    tagNames: str = Field(default="华语,日语,欧美", max_length=100)
    limit: int = Field(default=5, ge=1, le=50)


class SingleChartQuery(BaseModel):
    isNew: bool = Field(default=False)
    limit: int = Field(default=10, ge=1, le=50)


class PhoneRequest(BaseModel):
    phone: str = Field(..., pattern=r'^1[3-9]\d{9}$', description="手机号")

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not re.match(r'^1[3-9]\d{9}$', v):
            raise ValueError('手机号格式错误')
        return v


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=20, description="用户名")
    password: str = Field(..., min_length=6, max_length=100, description="密码")
    phone: str = Field(..., pattern=r'^1[3-9]\d{9}$', description="手机号")
    code: str = Field(..., min_length=6, max_length=6, description="验证码")

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not v or len(v.strip()) < 2:
            raise ValueError('用户名至少2个字符')
        if len(v) > 20:
            raise ValueError('用户名最多20个字符')
        return v.strip()

    @field_validator('code')
    @classmethod
    def validate_code(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError('验证码必须是6位数字')
        return v


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50, description="用户名")
    password: str = Field(..., min_length=1, description="密码")


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=30, pattern=r'^[a-zA-Z0-9_]+$')
    signature: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^1[3-9]\d{9}$')


class CursorPagination(BaseModel):
    cursor: Optional[str] = Field(None, description="游标（ISO日期格式）")
    size: int = Field(default=20, ge=1, le=100)

    @field_validator('cursor')
    @classmethod
    def validate_cursor(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        # 验证是否为有效的ISO日期格式
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
            return v
        except ValueError:
            raise ValueError('游标必须是有效的ISO日期格式')


class ArticleIdRequest(BaseModel):
    id: str = Field(..., pattern=r'^[0-9a-fA-F]{24}$', description="文章ID（24位十六进制）")


class LimitRequest(BaseModel):
    limit: int = Field(default=30, ge=1, le=100)