"""Java 后端 ApiResponse 解析辅助

Java 统一返回 {code, message, data}，但 data 的形态不统一：
- 分页对象：{total, size, page, list: [...]}
- 直接是数组：[...]
- 普通 dict（如歌单详情，按字段直接取）

历史教训：`data.get("data") or {}.get("list", [])` 因运算符优先级
实际解析为 `data.get("data") or ({}.get("list", []))`，取到整个
data 对象而不是里面的列表，遍历时对字符串调用 .get() 直接报错。
统一用这里的函数解析，避免各工具重复踩坑。
"""


def extract_data(payload) -> dict:
    """安全取出 ApiResponse 的 data 字段，非 dict 响应或缺失时返回空 dict"""
    if isinstance(payload, dict):
        data = payload.get("data")
        if isinstance(data, dict):
            return data
    return {}


def extract_list(payload, key: str = "list") -> list:
    """从 ApiResponse 的 data 中提取列表

    - data 是数组：直接返回
    - data 是分页/包装对象：返回 data[key]（默认 list）
    - 其他情况：返回空列表
    """
    if isinstance(payload, dict):
        data = payload.get("data")
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            result = data.get(key)
            if isinstance(result, list):
                return result
    return []
