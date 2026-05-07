export type SessionTimeStatus = "not_started" | "active" | "ended"

export function getSessionStatus(
  startAt: Date,
  endAt: Date,
  now = new Date()
): SessionTimeStatus {
  if (now < startAt) return "not_started"
  if (now >= endAt) return "ended"
  return "active"
}

export function isSessionActive(
  startAt: Date,
  endAt: Date,
  now = new Date()
): boolean {
  return getSessionStatus(startAt, endAt, now) === "active"
}

/** 距離開始的秒數（負數表示已開始） */
export function secondsUntilStart(startAt: Date, now = new Date()): number {
  return Math.floor((startAt.getTime() - now.getTime()) / 1000)
}
