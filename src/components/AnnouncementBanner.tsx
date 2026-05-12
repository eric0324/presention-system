"use client"

import { useEffect, useState } from "react"

export function AnnouncementBanner() {
  const [content, setContent] = useState("")
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    let es: EventSource
    let retries = 0

    function connect() {
      es = new EventSource("/api/announcement/stream")

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === "init" || data.type === "update") {
            setContent(data.content ?? "")
            setEnabled(data.enabled ?? false)
          }
        } catch { /* ignore */ }
      }

      es.onerror = () => {
        es.close()
        if (retries < 10) {
          retries++
          setTimeout(connect, 3000)
        }
      }

      es.onopen = () => { retries = 0 }
    }

    connect()
    return () => es?.close()
  }, [])

  if (!enabled || !content) return null

  return (
    <div className="w-full text-white text-sm px-4 py-2 text-center shrink-0" style={{ backgroundColor: "#004ef9" }}>
      {content}
    </div>
  )
}
