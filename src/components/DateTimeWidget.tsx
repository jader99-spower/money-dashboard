"use client";

import { useState, useEffect } from "react";
import { Sun, MapPin } from "lucide-react";

const WEATHER = { icon: Sun, label: "맑음", temp: "23°C", location: "서울" };

export default function DateTimeWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return <div className="w-48 h-16" />;

  const dateStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const timeStr = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const WeatherIcon = WEATHER.icon;

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      {/* 날씨 */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <WeatherIcon size={15} style={{ color: "#fbbf24" }} />
        <span className="text-sm font-medium" style={{ color: "#fbbf24" }}>
          {WEATHER.label}
        </span>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {WEATHER.temp}
        </span>
        <div className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
          <MapPin size={11} />
          <span className="text-xs">{WEATHER.location}</span>
        </div>
      </div>

      {/* 날짜 */}
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {dateStr}
      </p>

      {/* 시계 */}
      <p
        className="text-2xl font-bold tabular-nums tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {timeStr}
      </p>
    </div>
  );
}
