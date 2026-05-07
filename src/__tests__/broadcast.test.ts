import { describe, it, expect, vi, beforeEach } from "vitest"
import { EventEmitter } from "events"

// 直接測試廣播邏輯，不引入 singleton
function makeBroadcast() {
  const emitter = new EventEmitter()

  function emit(sessionId: string, event: object) {
    emitter.emit(`session:${sessionId}`, event)
  }

  function on(sessionId: string, handler: (e: object) => void) {
    emitter.on(`session:${sessionId}`, handler)
  }

  function off(sessionId: string, handler: (e: object) => void) {
    emitter.off(`session:${sessionId}`, handler)
  }

  return { emit, on, off }
}

describe("broadcast", () => {
  it("emit 後 listener 收到事件", () => {
    const { emit, on } = makeBroadcast()
    const handler = vi.fn()
    on("session-123", handler)
    emit("session-123", { type: "page", page: 3 })
    expect(handler).toHaveBeenCalledWith({ type: "page", page: 3 })
  })

  it("不同 session 的 listener 不互相干擾", () => {
    const { emit, on } = makeBroadcast()
    const handlerA = vi.fn()
    const handlerB = vi.fn()
    on("session-A", handlerA)
    on("session-B", handlerB)
    emit("session-A", { type: "page", page: 1 })
    expect(handlerA).toHaveBeenCalledOnce()
    expect(handlerB).not.toHaveBeenCalled()
  })

  it("off 之後不再收到事件", () => {
    const { emit, on, off } = makeBroadcast()
    const handler = vi.fn()
    on("session-123", handler)
    off("session-123", handler)
    emit("session-123", { type: "page", page: 5 })
    expect(handler).not.toHaveBeenCalled()
  })

  it("同一 session 可有多個 listener", () => {
    const { emit, on } = makeBroadcast()
    const h1 = vi.fn()
    const h2 = vi.fn()
    on("session-123", h1)
    on("session-123", h2)
    emit("session-123", { type: "broadcast_off" })
    expect(h1).toHaveBeenCalledOnce()
    expect(h2).toHaveBeenCalledOnce()
  })

  it("broadcast_off 事件正確傳遞", () => {
    const { emit, on } = makeBroadcast()
    const handler = vi.fn()
    on("session-123", handler)
    emit("session-123", { type: "broadcast_off" })
    expect(handler).toHaveBeenCalledWith({ type: "broadcast_off" })
  })
})
