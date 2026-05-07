import { describe, it, expect } from "vitest"
import { z } from "zod"

// 複製 API Route 中的 schema，直接測試驗證邏輯
const venueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c3aed"),
  order: z.number().int().default(0),
})

const sessionSchema = z.object({
  venueId: z.string().min(1),
  title: z.string().min(1),
  speaker: z.string().optional(),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
}).refine((d) => new Date(d.startAt) < new Date(d.endAt), {
  message: "開始時間必須早於結束時間",
  path: ["endAt"],
})

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

describe("場地 schema 驗證", () => {
  it("合法資料通過", () => {
    expect(venueSchema.safeParse({ name: "主舞台" }).success).toBe(true)
  })

  it("名稱空字串被拒絕", () => {
    expect(venueSchema.safeParse({ name: "" }).success).toBe(false)
  })

  it("強調色格式錯誤被拒絕", () => {
    expect(venueSchema.safeParse({ name: "A", accentColor: "purple" }).success).toBe(false)
  })

  it("合法 hex 強調色通過", () => {
    expect(venueSchema.safeParse({ name: "A", accentColor: "#ff00aa" }).success).toBe(true)
  })
})

describe("場次 schema 驗證", () => {
  const valid = {
    venueId: "v1",
    title: "主題演講",
    startAt: new Date(Date.now() + 1000).toISOString(),
    endAt: new Date(Date.now() + 3600_000).toISOString(),
  }

  it("合法資料通過", () => {
    expect(sessionSchema.safeParse(valid).success).toBe(true)
  })

  it("結束時間早於開始時間被拒絕", () => {
    const result = sessionSchema.safeParse({ ...valid, startAt: valid.endAt, endAt: valid.startAt })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endAt).toBeDefined()
    }
  })

  it("開始時間空白被拒絕", () => {
    expect(sessionSchema.safeParse({ ...valid, startAt: "" }).success).toBe(false)
  })

  it("venueId 空白被拒絕", () => {
    expect(sessionSchema.safeParse({ ...valid, venueId: "" }).success).toBe(false)
  })
})

describe("管理員 schema 驗證", () => {
  it("合法資料通過", () => {
    expect(adminSchema.safeParse({ email: "a@b.com", password: "12345678", name: "Admin" }).success).toBe(true)
  })

  it("Email 格式錯誤被拒絕", () => {
    expect(adminSchema.safeParse({ email: "notanemail", password: "12345678", name: "A" }).success).toBe(false)
  })

  it("密碼少於 8 位被拒絕", () => {
    expect(adminSchema.safeParse({ email: "a@b.com", password: "1234", name: "A" }).success).toBe(false)
  })

  it("名稱空白被拒絕", () => {
    expect(adminSchema.safeParse({ email: "a@b.com", password: "12345678", name: "" }).success).toBe(false)
  })
})
