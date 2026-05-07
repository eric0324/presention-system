import { describe, it, expect } from "vitest"
import { isSessionActive } from "@/lib/time"

/**
 * T37：驗證 slide proxy 的時間驗證邏輯
 * （直接測試 isSessionActive，不真正打 DB 或 CloudFront）
 */
describe("slide proxy 時間驗證邏輯", () => {
  const makeSession = (startOffsetMin: number, endOffsetMin: number) => ({
    startAt: new Date(Date.now() + startOffsetMin * 60_000),
    endAt: new Date(Date.now() + endOffsetMin * 60_000),
  })

  it("場次進行中 → 允許存取", () => {
    const session = makeSession(-30, 30)
    expect(isSessionActive(session.startAt, session.endAt)).toBe(true)
  })

  it("場次未開始 → 拒絕存取", () => {
    const session = makeSession(10, 60)
    expect(isSessionActive(session.startAt, session.endAt)).toBe(false)
  })

  it("場次已結束 → 拒絕存取", () => {
    const session = makeSession(-90, -30)
    expect(isSessionActive(session.startAt, session.endAt)).toBe(false)
  })

  it("僅剩 1 秒時仍允許存取", () => {
    const start = new Date(Date.now() - 3600_000)
    const end = new Date(Date.now() + 1000)
    expect(isSessionActive(start, end)).toBe(true)
  })

  it("剛好結束（差 1ms）→ 拒絕存取", () => {
    const start = new Date(Date.now() - 3600_000)
    const end = new Date(Date.now() - 1)
    expect(isSessionActive(start, end)).toBe(false)
  })
})
