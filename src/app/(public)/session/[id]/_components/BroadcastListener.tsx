"use client"

import { useEffect } from "react"

type Props = {
  sessionId: string
  onPageChange: (page: number) => void
  onBroadcastChange: (enabled: boolean) => void
  onReload: () => void
}

export function BroadcastListener({ sessionId, onPageChange, onBroadcastChange, onReload }: Props) {
  useEffect(() => {
    let es: EventSource
    let retries = 0

    function connect() {
      es = new EventSource(`/api/session/${sessionId}/stream`)

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === "init") {
            onBroadcastChange(data.broadcastEnabled)
            if (data.broadcastEnabled) onPageChange(data.page)
          } else if (data.type === "page") {
            onPageChange(data.page)
          } else if (data.type === "broadcast_on") {
            onBroadcastChange(true)
            onPageChange(data.page)
          } else if (data.type === "broadcast_off") {
            onBroadcastChange(false)
          } else if (data.type === "slides_updated") {
            onReload()
          }
        } catch {
          // ignore parse error
        }
      }

      es.onerror = () => {
        es.close()
        if (retries < 5) {
          retries++
          setTimeout(connect, 2000)
        }
      }

      es.onopen = () => { retries = 0 }
    }

    connect()
    return () => es?.close()
  }, [sessionId, onPageChange, onBroadcastChange, onReload])

  return null
}
