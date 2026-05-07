"use client"

import { useEffect, useState } from "react"

function format(seconds: number) {
  if (seconds <= 0) return "即將開始"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function Countdown({ targetIso, now }: { targetIso: string; now: string }) {
  const [secs, setSecs] = useState(() =>
    Math.max(0, Math.floor((new Date(targetIso).getTime() - new Date(now).getTime()) / 1000))
  )

  useEffect(() => {
    const id = setInterval(() => setSecs((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  return <span className="font-medium text-zinc-300">{format(secs)}</span>
}
