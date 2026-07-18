import { describe, it, expect } from "vitest"
import { createSlidesInOrder } from "@/lib/slideOrdering"

/**
 * 重現「重整後簡報順序亂掉」的 bug：
 * 一次上傳多張時，order 必須綁定「選檔順序（陣列索引）」，
 * 而不是「上傳／寫入完成的先後」。因為並行上傳誰先完成是不確定的，
 * 若 order 依完成時序分配，重整後（後端以 order asc 讀取）順序就會亂掉。
 */
describe("createSlidesInOrder", () => {
  it("order 依選檔順序分配，與寫入完成時序無關", async () => {
    const files = ["a", "b", "c", "d"]

    // 故意讓「後面的檔案先完成」：越後面延遲越短
    const delays = [40, 30, 20, 10]
    const persist = (file: string, order: number) =>
      new Promise<{ file: string; order: number }>((resolve) => {
        setTimeout(() => resolve({ file, order }), delays[files.indexOf(file)])
      })

    const result = await createSlidesInOrder(files, 0, persist)

    // 回傳順序須維持選檔順序，且每個 order = 索引 + base
    expect(result.map((r) => r.file)).toEqual(["a", "b", "c", "d"])
    expect(result.map((r) => r.order)).toEqual([0, 1, 2, 3])
  })

  it("baseOrder 位移正確（接續既有張數）", async () => {
    const files = ["x", "y"]
    const persist = (file: string, order: number) => Promise.resolve({ file, order })

    const result = await createSlidesInOrder(files, 5, persist)

    expect(result.map((r) => r.order)).toEqual([5, 6])
  })

  it("空陣列回傳空結果", async () => {
    const persist = (file: string, order: number) => Promise.resolve({ file, order })
    const result = await createSlidesInOrder<string, { file: string; order: number }>([], 0, persist)
    expect(result).toEqual([])
  })
})
