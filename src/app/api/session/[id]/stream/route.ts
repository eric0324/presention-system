import { db } from "@/lib/db"
import { onBroadcast, offBroadcast, BroadcastEvent } from "@/lib/broadcast"
import { isSessionActive } from "@/lib/time"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await db.session.findUnique({
    where: { id },
    select: { startAt: true, endAt: true, broadcastEnabled: true, broadcastPage: true },
  })

  if (!session || !isSessionActive(session.startAt, session.endAt)) {
    return new Response("場次不在進行中", { status: 403 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
        } catch {
          // 連線已關閉
        }
      }

      // 連線後立即推送當前廣播狀態
      send({
        type: "init",
        broadcastEnabled: session.broadcastEnabled,
        page: session.broadcastPage,
      })

      const handler = (event: BroadcastEvent) => send(event)
      onBroadcast(id, handler)

      // 定時心跳，保持連線（每 25 秒）
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(": heartbeat\n\n")
        } catch {
          clearInterval(heartbeat)
        }
      }, 25000)

      // 清理
      _req.signal.addEventListener("abort", () => {
        offBroadcast(id, handler)
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
