"""安全相关中间件。

当前提供：
- IpWhitelistMiddleware：限制仅允许本地回环访问（AI 服务仅供 Java 后端内部调用）

注：AI 服务不直接对浏览器暴露，因此不需要 X-Frame-Options、CSP 等浏览器侧安全响应头；
真正的访问控制由 IP 白名单 + Java 后端调用方鉴权共同保障。
"""
import ipaddress
import logging
from typing import Iterable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


def _client_ip(request: Request) -> str | None:
    # 优先取 X-Forwarded-For 的首个地址，回退到直接连接 IP
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


def _is_loopback(ip_str: str | None) -> bool:
    if not ip_str:
        return False
    try:
        return ipaddress.ip_address(ip_str).is_loopback
    except ValueError:
        return False


class IpWhitelistMiddleware(BaseHTTPMiddleware):
    """仅允许白名单 IP 访问，默认仅允许回环地址。"""

    def __init__(self, app: ASGIApp, allowed_ips: Iterable[str] | None = None) -> None:
        super().__init__(app)
        # 默认仅允许回环地址，可传入额外允许的 IP
        self.extra_allowed = set(allowed_ips or [])

    async def dispatch(self, request: Request, call_next):
        client_ip = _client_ip(request)
        if not (_is_loopback(client_ip) or client_ip in self.extra_allowed):
            logger.warning("Blocked request from non-whitelisted IP: %s %s", client_ip, request.url.path)
            return Response(status_code=403, content="Forbidden")
        return await call_next(request)
