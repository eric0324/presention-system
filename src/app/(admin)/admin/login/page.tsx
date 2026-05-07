"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    })
    setLoading(false)

    if (result?.error) {
      toast.error("帳號或密碼錯誤")
    } else {
      router.push("/admin/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      {/* 背景光暈 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <span className="text-violet-400 text-xl">⬡</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">後台管理</h1>
          <p className="text-sm text-zinc-400 mt-1">請登入以繼續</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-300 text-sm">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="bg-zinc-800/60 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-zinc-300 text-sm">
              密碼
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="bg-zinc-800/60 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium"
          >
            {loading ? "登入中…" : "登入"}
          </Button>
        </form>
      </div>
    </div>
  )
}
