/**
 * Watchlist alert worker.
 * POST /api/jobs/check-watchlist  with Authorization: Bearer $CRON_SECRET
 *
 * For every active watch, evaluate rules against current intel and (when
 * triggered) insert a row into the `notifications` table — picked up by
 * NotificationBell on next poll.
 *
 * Designed to run hourly. Idempotent within `last_alerted_at + 24h` window
 * to avoid spamming the same user.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 300;

interface Rule {
  type: "price_below" | "yield_above" | "new_catalyst" | "titan_score_above" | "roi_above";
  value?: number;
}

function checkAuth(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing service role key");
  return createClient(url, key, { auth: { persistSession: false } });
}

function evalRule(rule: Rule, ctx: {
  minPrice: number | null;
  grossYield: number | null;
  titanScore: number | null;
  roiFromLaunch: number | null;
  newCatalystSinceLastAlert: boolean;
}): string | null {
  switch (rule.type) {
    case "price_below":
      if (rule.value == null || ctx.minPrice == null) return null;
      return ctx.minPrice <= rule.value ? `Có căn dưới ${(rule.value / 1_000_000_000).toFixed(1)} tỷ` : null;
    case "yield_above":
      if (rule.value == null || ctx.grossYield == null) return null;
      return ctx.grossYield >= rule.value ? `Yield đạt ${ctx.grossYield.toFixed(1)}% (≥ ${rule.value}%)` : null;
    case "titan_score_above":
      if (rule.value == null || ctx.titanScore == null) return null;
      return ctx.titanScore >= rule.value ? `Titan Score ${ctx.titanScore.toFixed(1)} (≥ ${rule.value})` : null;
    case "roi_above":
      if (rule.value == null || ctx.roiFromLaunch == null) return null;
      return ctx.roiFromLaunch >= rule.value ? `ROI từ mở bán ${Math.round(ctx.roiFromLaunch)}%` : null;
    case "new_catalyst":
      return ctx.newCatalystSinceLastAlert ? "Có catalyst mới" : null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const supabase = getAdminClient();

  const { data: watches, error } = await supabase
    .from("project_watchlist")
    .select("id, user_id, project_id, rules, last_alerted_at, projects:projects(name, slug, min_price)");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  let firedCount = 0;
  const now = new Date();

  for (const w of (watches || []) as any[]) {
    // Cooldown 24h
    if (w.last_alerted_at) {
      const last = new Date(w.last_alerted_at).getTime();
      if (now.getTime() - last < 24 * 3600 * 1000) continue;
    }

    const project = Array.isArray(w.projects) ? w.projects[0] : w.projects;
    if (!project) continue;

    // Get latest intel
    const { data: intel } = await supabase
      .from("project_intel")
      .select("titan_score, gross_yield, roi_from_launch")
      .eq("project_id", w.project_id)
      .single();

    // Check for new catalysts since last alert
    let newCatalyst = false;
    if (w.last_alerted_at) {
      const { count } = await supabase
        .from("project_catalysts")
        .select("*", { count: "exact", head: true })
        .eq("project_id", w.project_id)
        .gte("created_at", w.last_alerted_at);
      newCatalyst = (count || 0) > 0;
    }

    const ctx = {
      minPrice: project.min_price ?? null,
      grossYield: intel?.gross_yield != null ? Number(intel.gross_yield) : null,
      titanScore: intel?.titan_score != null ? Number(intel.titan_score) : null,
      roiFromLaunch: intel?.roi_from_launch != null ? Number(intel.roi_from_launch) : null,
      newCatalystSinceLastAlert: newCatalyst,
    };

    const fired: string[] = [];
    for (const r of (w.rules || []) as Rule[]) {
      const msg = evalRule(r, ctx);
      if (msg) fired.push(msg);
    }

    if (fired.length === 0) continue;

    // Insert notification
    await supabase.from("notifications").insert({
      user_id: w.user_id,
      type: "price_alert",
      title: `${project.name} có cập nhật mới`,
      message: fired.join(" · "),
      link: `/projects/${project.slug}`,
      read: false,
    });

    // Mark alerted
    await supabase
      .from("project_watchlist")
      .update({ last_alerted_at: now.toISOString() })
      .eq("id", w.id);

    firedCount++;
  }

  return NextResponse.json({ ok: true, total: (watches || []).length, fired: firedCount });
}
