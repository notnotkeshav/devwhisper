"use client";

import Link from "next/link";

export function TodayLink() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const dateStr = `${y}-${m}-${d}`;

  return (
    <Link
      href={`/daily/${dateStr}`}
      className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
    >
      Today
    </Link>
  );
}
