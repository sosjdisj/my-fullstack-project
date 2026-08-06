/** LRC歌词行 */
export interface LrcLine {
  time: number // 秒
  text: string
}

/** 解析LRC歌词文本为时间轴数组 */
export function parseLrc(lrcText: string): LrcLine[] {
  const lines = lrcText.split('\n')
  const result: LrcLine[] = []

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (!match) continue

    const min = Number(match[1])
    const sec = Number(match[2])
    const ms = match[3].length === 2 ? Number(match[3]) * 10 : Number(match[3])
    const time = min * 60 + sec + ms / 1000

    result.push({ time, text: match[4].trim() })
  }

  return result.sort((a, b) => a.time - b.time)
}

/** 根据当前播放时间找到高亮行索引 */
export function findCurrentLine(lines: LrcLine[], currentTime: number): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) return i
  }
  return 0
}
