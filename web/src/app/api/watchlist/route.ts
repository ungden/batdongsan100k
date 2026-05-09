/**
 * Watchlist API
 *
 *   GET  /api/watchlist               → list my watch entries (joined with project name)
 *   POST /api/watchlist               body: { projectId, rules }
 *   DELETE /api/watchlist?id=<id>     → unwatch
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("project_watchlist")
    .select("id, project_id, rules, last_alerted_at, projects:projects(name, slug, cover_image)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.projectId || !Array.isArray(body.rules)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  // Validate rule shapes
  const validTypes = new Set(["price_below", "yield_above", "new_catalyst", "titan_score_above", "roi_above"]);
  for (const r of body.rules) {
    if (!r || !validTypes.has(r.type)) {
      return NextResponse.json({ ok: false, error: `invalid_rule_type:${r?.type}` }, { status: 400 });
    }
    if (r.type !== "new_catalyst" && (typeof r.value !== "number" || !Number.isFinite(r.value))) {
      return NextResponse.json({ ok: false, error: `rule_${r.type}_requires_number_value` }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("project_watchlist")
    .upsert({ user_id: user.id, project_id: body.projectId, rules: body.rules }, { onConflict: "user_id,project_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });

  const { error } = await supabase
    .from("project_watchlist")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
