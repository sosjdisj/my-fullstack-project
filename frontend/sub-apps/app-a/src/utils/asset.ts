/**
 * 解析子应用静态资源路径
 *
 * 背景：micro-app 不会自动改写 <audio>/<img> 等 HTML 元素的 src 属性。
 * 在主应用环境下，子应用的绝对路径 /audio/xxx.mp3 会被浏览器解析为主应用根，
 * 导致 404 → <audio> 抛 NotSupportedError。
 *
 * 本函数在微前端环境下拼接子应用的 public path 前缀，独立运行时原样返回。
 */
export function resolveAssetPath(path: string | undefined | null): string {
    if (!path) return ''

    // 已经是完整 URL（http/https）或 data/blob URI，直接返回
    if (/^(https?:|data:|blob:)/i.test(path)) return path

    // 微前端环境下，拼接子应用的 public path 前缀
    if (window.__MICRO_APP_ENVIRONMENT__ && window.__MICRO_APP_PUBLIC_PATH__) {
        const prefix = window.__MICRO_APP_PUBLIC_PATH__
        // path 以 / 开头时去掉前导斜杠，避免拼接出双斜杠
        const normalized = path.startsWith('/') ? path.slice(1) : path
        // 确保前缀以 / 结尾，避免拼接错误
        const normalizedPrefix = prefix.endsWith('/') ? prefix : prefix + '/'
        return normalizedPrefix + normalized
    }

    // 独立运行时，直接返回原路径
    return path
}
