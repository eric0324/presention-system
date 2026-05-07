"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Countdown } from "./Countdown";
import type { Session, Venue } from "@prisma/client";

type Props = {
  venue: Venue & {
    activeSession: Session | null;
    nextSession: Session | null;
    sessionCount: number;
  };
  index: number;
  now: string;
};

export function VenueCard({ venue, index, now }: Props) {
  const { activeSession, nextSession, sessionCount } = venue;
  const href = activeSession
    ? `/session/${activeSession.id}`
    : nextSession
      ? `/session/${nextSession.id}`
      : `/venue/${venue.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href={href} className="block group">
        <div
          className="relative rounded-xl border border-white/10 bg-zinc-900/60 px-6 py-4 overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-zinc-900/80"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              `inset 3px 0 0 ${venue.accentColor}, 0 0 30px -8px ${venue.accentColor}30`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          {/* 左側色條 */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: venue.accentColor }}
          />

          <div className="flex items-center gap-6 ml-2">
            {/* 場地名稱 */}
            <div className="w-28 shrink-0">
              <h3 className="text-sm font-semibold text-white leading-tight">
                {venue.name}
              </h3>
              {venue.description && (
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">
                  {venue.description}
                </p>
              )}
            </div>

            {/* 分隔線 */}
            <div className="w-px self-stretch bg-white/10 shrink-0" />

            {/* 目前場次 / 下一場 */}
            <div className="flex-1 min-w-0">
              {activeSession ? (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-sm text-white font-medium truncate">
                    {activeSession.title}
                  </span>
                  {activeSession.speaker && (
                    <span className="text-xs text-zinc-400 shrink-0">
                      {activeSession.speaker}
                    </span>
                  )}
                  <span className="text-xs text-zinc-600 shrink-0">
                    {new Date(activeSession.startAt).toLocaleTimeString(
                      "zh-TW",
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                    {" – "}
                    {new Date(activeSession.endAt).toLocaleTimeString("zh-TW", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ) : nextSession ? (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0">
                    下一場
                  </span>
                  <span className="text-sm text-white font-medium truncate">
                    {nextSession.title}
                  </span>
                  {nextSession.speaker && (
                    <span className="text-xs text-zinc-400 shrink-0">
                      {nextSession.speaker}
                    </span>
                  )}
                  <span className="text-xs text-zinc-600 shrink-0">
                    距離開始{" "}
                    <Countdown
                      targetIso={nextSession.startAt.toISOString()}
                      now={now}
                    />
                  </span>
                </div>
              ) : (
                <span className="text-xs text-zinc-600">
                  {sessionCount === 0 ? "尚未安排場次" : "場次已結束"}
                </span>
              )}
            </div>

            {/* 右側：狀態 + 箭頭 */}
            <div className="flex items-center gap-3 shrink-0">
              {activeSession && (
                <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full animate-pulse">
                  進行中
                </span>
              )}
              <span className="text-zinc-600 group-hover:text-zinc-300 transition-colors text-sm group-hover:translate-x-0.5 transform duration-200">
                →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
