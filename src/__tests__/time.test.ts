import { describe, it, expect } from "vitest"
import { getSessionStatus, isSessionActive, secondsUntilStart } from "@/lib/time"

const T = (offsetMinutes: number) =>
  new Date(Date.now() + offsetMinutes * 60 * 1000)

describe("getSessionStatus", () => {
  it("未到開始時間 → not_started", () => {
    expect(getSessionStatus(T(10), T(60))).toBe("not_started")
  })

  it("在時間範圍內 → active", () => {
    expect(getSessionStatus(T(-30), T(30))).toBe("active")
  })

  it("已超過結束時間 → ended", () => {
    expect(getSessionStatus(T(-120), T(-60))).toBe("ended")
  })

  it("恰好等於開始時間 → active", () => {
    const now = new Date()
    expect(getSessionStatus(now, T(60), now)).toBe("active")
  })

  it("恰好等於結束時間 → ended", () => {
    const now = new Date()
    expect(getSessionStatus(T(-60), now, now)).toBe("ended")
  })
})

describe("isSessionActive", () => {
  it("進行中回傳 true", () => {
    expect(isSessionActive(T(-10), T(10))).toBe(true)
  })

  it("未開始回傳 false", () => {
    expect(isSessionActive(T(10), T(60))).toBe(false)
  })

  it("已結束回傳 false", () => {
    expect(isSessionActive(T(-60), T(-10))).toBe(false)
  })
})

describe("secondsUntilStart", () => {
  it("未開始時回傳正數秒數", () => {
    const secs = secondsUntilStart(T(2)) // 2 分鐘後開始
    expect(secs).toBeGreaterThan(100)
    expect(secs).toBeLessThanOrEqual(120)
  })

  it("已開始時回傳負數", () => {
    const secs = secondsUntilStart(T(-5))
    expect(secs).toBeLessThan(0)
  })
})
