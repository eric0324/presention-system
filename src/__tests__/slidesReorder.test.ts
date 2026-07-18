import { describe, it, expect, vi, beforeEach } from "vitest"

// reorder 的多筆 update 必須包在單一 transaction 裡（原子性）。
// 若用 Promise.all 各自 await，其中一筆失敗會留下重複／不連續的 order，
// 進而讓列表（order asc）出現重複值、每次重整順序不同。

vi.mock("@/lib/auth", () => ({ auth: vi.fn(async () => ({ user: { id: "u1" } })) }))
vi.mock("@/lib/broadcast", () => ({ emitBroadcast: vi.fn() }))

const update = vi.fn((args: unknown) => ({ __update: args }))
const $transaction = vi.fn(async (ops: unknown[]) => ops.map(() => ({ sessionId: "s1" })))
vi.mock("@/lib/db", () => ({
  db: {
    slide: { update: (a: unknown) => update(a) },
    $transaction: (a: unknown[]) => $transaction(a),
  },
}))

import { PATCH } from "@/app/api/admin/slides/reorder/route"

describe("slides reorder route", () => {
  beforeEach(() => {
    update.mockClear()
    $transaction.mockClear()
  })

  const call = (ids: string[]) =>
    PATCH(
      new Request("http://test/api/admin/slides/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
    )

  it("以單一 transaction 原子性更新全部 slides", async () => {
    const res = await call(["c", "a", "b"])
    expect(res.status).toBe(200)

    // 關鍵：必須用一次 $transaction 包住全部，而不是 N 個各自 await
    expect($transaction).toHaveBeenCalledOnce()
    expect($transaction.mock.calls[0][0]).toHaveLength(3)
  })

  it("order 依新陣列位置指派", async () => {
    await call(["c", "a", "b"])
    expect(update).toHaveBeenNthCalledWith(1, { where: { id: "c" }, data: { order: 0 } })
    expect(update).toHaveBeenNthCalledWith(2, { where: { id: "a" }, data: { order: 1 } })
    expect(update).toHaveBeenNthCalledWith(3, { where: { id: "b" }, data: { order: 2 } })
  })
})
