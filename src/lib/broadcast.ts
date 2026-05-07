import { EventEmitter } from "events"

declare global {
  // eslint-disable-next-line no-var
  var __broadcastEmitter: EventEmitter | undefined
}

// 單 process singleton，確保 Next.js hot reload 不重建
export const broadcastEmitter: EventEmitter =
  globalThis.__broadcastEmitter ?? new EventEmitter()

if (process.env.NODE_ENV !== "production") {
  globalThis.__broadcastEmitter = broadcastEmitter
}

broadcastEmitter.setMaxListeners(500)

export type BroadcastEvent =
  | { type: "page"; page: number }
  | { type: "broadcast_on"; page: number }
  | { type: "broadcast_off" }
  | { type: "slides_updated" }

export function emitBroadcast(sessionId: string, event: BroadcastEvent) {
  broadcastEmitter.emit(`session:${sessionId}`, event)
}

export function onBroadcast(
  sessionId: string,
  handler: (event: BroadcastEvent) => void
) {
  broadcastEmitter.on(`session:${sessionId}`, handler)
}

export function offBroadcast(
  sessionId: string,
  handler: (event: BroadcastEvent) => void
) {
  broadcastEmitter.off(`session:${sessionId}`, handler)
}

export type AnnouncementEvent = { content: string; enabled: boolean }

export function emitAnnouncement(event: AnnouncementEvent) {
  broadcastEmitter.emit("announcement", event)
}

export function onAnnouncement(handler: (event: AnnouncementEvent) => void) {
  broadcastEmitter.on("announcement", handler)
}

export function offAnnouncement(handler: (event: AnnouncementEvent) => void) {
  broadcastEmitter.off("announcement", handler)
}
