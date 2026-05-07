import { db } from "@/lib/db"
import { onAnnouncement, offAnnouncement, AnnouncementEvent } from "@/lib/broadcast"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const announcement = await db.announcement.findFirst()

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
        } catch {
          // 連線已關閉
        }
      }

      // 連線後立即推送目前公告狀態
      send({
        type: "init",
        content: announcement?.content ?? "",
        enabled: announcement?.enabled ?? false,
      })

      const handler = (event: AnnouncementEvent) => {
        send({ type: "update", content: event.content, enabled: event.enabled })
      }
      onAnnouncement(handler)

      // 定時心跳，保持連線（每 25 秒）
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(": heartbeat\n\n")
        } catch {
          clearInterval(heartbeat)
        }
      }, 25000)

      // 清理
      req.signal.addEventListener("abort", () => {
        offAnnouncement(handler)
        clearInterval(heartbeat)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
