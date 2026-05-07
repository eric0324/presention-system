"use client"

import { useEffect, useState } from "react"

type Props = {
  sessionId: string
  currentPage: number
}

export function AntiCaptureMask({ sessionId, currentPage }: Props) {
  const [pos, setPos] = useState({ x: 20, y: 20 })
  const [tag, setTag] = useState("")

  useEffect(() => {
    setTag(`${sessionId.slice(-4).toUpperCase()} · ${new Date().toLocaleTimeString("zh-TW")}`)
  }, [sessionId])

  // 每次換頁時，隨機移動浮水印位置
  useEffect(() => {
    setPos({
      x: 10 + Math.random() * 70,
      y: 10 + Math.random() * 70,
    })
  }, [currentPage])

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-20"
      aria-hidden
    >
      <div
        className="absolute text-white/[0.07] text-sm font-mono whitespace-nowrap -rotate-15 leading-loose"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>{tag}</div>
        ))}
      </div>
    </div>
  )
}
