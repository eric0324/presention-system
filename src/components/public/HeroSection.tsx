"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-16 pb-10 overflow-hidden text-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto mb-8"
      >
        <Image
          src="/event-logo.svg"
          alt="活動名稱"
          width={744}
          height={100}
          className="w-full h-auto"
          priority
        />
      </motion.div>
    </section>
  )
}
