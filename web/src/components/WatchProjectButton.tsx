"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  projectId: string;
  projectName: string;
  className?: string;
}

interface Rule {
  type: "price_below" | "yield_above" | "new_catalyst" | "titan_score_above" | "roi_above";
  value?: number;
}

const PRESETS: { label: string; rules: Rule[] }[] = [
  { label: "Giảm giá 10%+", rules: [{ type: "price_below", value: 3_000_000_000 }] },
  { label: "Có catalyst mới", rules: [{ type: "new_catalyst" }] },
  { label: "Yield ≥ 5%", rules: [{ type: "yield_above", value: 5 }] },
  { label: "Titan Score ≥ 8", rules: [{ type: "titan_score_above", value: 8 }] },
];

export default function WatchProjectButton({ projectId, projectName, className }: Props) {
  const [isWatching, setIsWatching] = useState<boolean | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      setSignedIn(!!user);
      if (!user) { setIsWatching(false); return; }
      const res = await fetch("/api/watchlist", { credentials: "include" });
      if (!res.ok) { setIsWatching(false); return; }
      const json = await res.json();
      const found = (json.items || []).find((w: any) => w.project_id === projectId);
      setIsWatching(!!found);
      setWatchId(found?.id || null);
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  const watch = async (rules: Rule[]) => {
    setBusy(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, rules }),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setIsWatching(true);
        setWatchId(json.item?.id || null);
        setShowMenu(false);
      }
    } finally {
      setBusy(false);
    }
  };

  const unwatch = async () => {
    if (!watchId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/watchlist?id=${watchId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setIsWatching(false); setWatchId(null); setShowMenu(false); }
    } finally {
      setBusy(false);
    }
  };

  if (signedIn === false) {
    return (
      <a href="/login" className={`inline-flex items-center gap-1.5 bg-white text-on-surface text-sm font-bold px-4 py-2 rounded-xl border border-outline-variant/30 hover:border-primary/40 ${className || ""}`}>
        <span className="material-symbols-outlined text-[16px]">notifications</span>
        Đăng nhập để theo dõi
      </a>
    );
  }

  return (
    <div className={`relative inline-block ${className || ""}`}>
      <button
        onClick={() => setShowMenu((v) => !v)}
        disabled={busy || isWatching === null}
        className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl border ${
          isWatching
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-white text-on-surface border-outline-variant/30 hover:border-primary/40"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">{isWatching ? "notifications_active" : "notifications"}</span>
        {isWatching ? "Đang theo dõi" : "Theo dõi & cảnh báo"}
      </button>

      {showMenu && (
        <div className="absolute right-0 z-30 mt-2 w-72 bg-white rounded-2xl border border-outline-variant/30 shadow-xl p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
            Quy tắc cảnh báo cho {projectName}
          </div>
          {isWatching ? (
            <button
              onClick={unwatch}
              disabled={busy}
              className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg font-bold"
            >
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">notifications_off</span>
              Tắt theo dõi
            </button>
          ) : (
            PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => watch(p.rules)}
                disabled={busy}
                className="w-full text-left px-3 py-2 text-sm hover:bg-surface-container-lowest rounded-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">add_alert</span>
                {p.label}
              </button>
            ))
          )}
          <button onClick={() => setShowMenu(false)} className="w-full text-center text-xs text-on-surface-variant mt-2 py-1 hover:underline">
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
