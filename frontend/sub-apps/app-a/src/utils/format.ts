/**
 * 格式化数量
 * @param count - 数量
 * @param threshold - 阈值，超过此值才显示"万"，默认10000
 * @returns 格式化后的字符串
 */
export const formatPlayCount = (count: number, threshold: number = 10000): string => {
    if (count >= threshold) {
        return `${(count / 10000).toFixed(1)}万`
    }
    return count.toString()
}

/**
 * 格式化日期，提取日期部分（YYYY-MM-DD）
 * @param dateTime - ISO 格式的时间字符串，如 "2025-07-10T00:00:00.000+00:00"
 * @returns 格式化后的日期字符串，如 "2025-07-10"
 * @example
 * formatDate("2025-07-10T00:00:00.000+00:00") // "2025-07-10"
 */
export const formatDate = (dateTime: string | undefined | null) => {
    if (!dateTime) return;
    return dateTime.split('T')[0]
}