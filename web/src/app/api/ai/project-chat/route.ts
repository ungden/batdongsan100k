/**
 * AI Chat for a project.
 *
 * POST /api/ai/project-chat
 *   body: { slug: string, question: string }
 *
 * If ANTHROPIC_API_KEY is set → calls Claude API (fetch, no SDK).
 * Otherwise → returns a templated response generated from the local intel context.
 *
 * Response: streamed plain text (consumed via response.body.getReader())
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProjectDeepIntel } from "@/lib/queries/projects";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Bạn là analyst BĐS của TitanHome. Trả lời ngắn gọn (3-5 câu),
dựa duy nhất vào dữ liệu intel được cung cấp. Không bịa số liệu.
Văn phong thân mật như cố vấn cho bạn, dùng "bạn".
Ưu tiên: nói "có nên mua không" + "rủi ro chính" + "nên cân nhắc gì".`;

function buildContext(deep: NonNullable<Awaited<ReturnType<typeof getProjectDeepIntel>>>): string {
  const p = deep.project;
  const i = p.intel;
  const lines = [
    `Dự án: ${p.name} (${p.district}, ${p.city})`,
    `Chủ đầu tư: ${p.developer || "—"}`,
    `Pháp lý: ${p.legalStatus || "—"}`,
    `Quy mô: ${p.totalUnits ?? "—"} căn`,
    `Giá hiện tại: ${(p.avgPricePerSqm / 1_000_000).toFixed(1)} tr/m²`,
    `Khoảng giá: ${p.priceRange || "—"}`,
    i ? `Titan Score: ${i.titanScore?.toFixed(1)}/10 (Investment ${i.investmentScore?.toFixed(1)} · Rental ${i.rentalScore?.toFixed(1)} · Living ${i.livingScore?.toFixed(1)})` : "",
    i?.roiFromLaunch != null ? `ROI từ mở bán: ${i.roiFromLaunch.toFixed(0)}%` : "",
    i?.cagrSinceLaunch != null ? `CAGR: ${i.cagrSinceLaunch.toFixed(1)}%/năm` : "",
    i?.priceChange12m != null ? `Tăng/giảm 12 tháng: ${i.priceChange12m.toFixed(1)}%` : "",
    i?.grossYield != null ? `Gross yield: ${i.grossYield.toFixed(1)}%/năm` : "",
    i?.liquidityScore != null ? `Liquidity Score: ${i.liquidityScore.toFixed(1)}/10` : "",
    i?.activeSaleListings != null ? `Tin bán đang rao: ${i.activeSaleListings}` : "",
    i?.activeRentListings != null ? `Tin cho thuê: ${i.activeRentListings}` : "",
    i?.riskTags?.length ? `Risk tags: ${i.riskTags.join(", ")}` : "",
    i?.strengths?.length ? `Điểm mạnh: ${i.strengths.join(" / ")}` : "",
    i?.weaknesses?.length ? `Điểm yếu: ${i.weaknesses.join(" / ")}` : "",
    deep.catalysts.length ? `Catalyst:\n${deep.catalysts.slice(0, 5).map((c) => `- [${c.impact}] ${c.title}${c.expectedDate ? ` (${c.expectedDate.slice(0, 4)})` : ""}`).join("\n")}` : "",
    deep.nearby.length ? `Dự án cùng khu (Titan Score): ${deep.nearby.map((n) => `${n.name} ${n.titanScore?.toFixed(1) || "?"}`).join(" · ")}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

// ============================================================
// Templated fallback (no AI key) — generates a focused answer from data
// ============================================================
function templatedAnswer(deep: NonNullable<Awaited<ReturnType<typeof getProjectDeepIntel>>>, question: string): string {
  const p = deep.project;
  const i = p.intel;
  const q = question.toLowerCase();

  const lines: string[] = [];

  if (q.includes("có nên") || q.includes("đáng mua") || q.includes("nên mua")) {
    if (i?.titanScore != null) {
      const verdict = i.titanScore >= 7 ? "đáng cân nhắc" : i.titanScore >= 5 ? "tạm ổn nhưng cần xét kỹ" : "không phù hợp với mọi người";
      lines.push(`Tổng Titan Score ${i.titanScore.toFixed(1)}/10 — ${verdict}.`);
    }
    if (i?.roiFromLaunch != null && i.roiFromLaunch > 0) {
      lines.push(`Người mua từ lúc mở bán đã lời khoảng ${Math.round(i.roiFromLaunch)}% — chứng minh thị trường tin tưởng dự án.`);
    }
    if (i?.weaknesses?.length) {
      lines.push(`Lưu ý: ${i.weaknesses[0]}.`);
    }
  } else if (q.includes("giá") && (q.includes("cao") || q.includes("đắt") || q.includes("rẻ"))) {
    lines.push(`Giá trung bình hiện tại ${(p.avgPricePerSqm / 1_000_000).toFixed(1)} tr/m².`);
    if (i?.priceChange12m != null) {
      lines.push(`12 tháng qua giá ${i.priceChange12m > 0 ? "tăng" : "giảm"} ${Math.abs(i.priceChange12m).toFixed(1)}% — ${i.priceChange12m > 15 ? "đang tăng nóng" : i.priceChange12m > 0 ? "tăng đều" : "đi xuống"}.`);
    }
    if (i?.cagrSinceLaunch != null) {
      lines.push(`CAGR ${i.cagrSinceLaunch.toFixed(1)}%/năm tính từ mở bán.`);
    }
  } else if (q.includes("cho thuê") || q.includes("yield")) {
    if (i?.grossYield != null) {
      const verdict = i.grossYield >= 5 ? "ổn để cho thuê" : i.grossYield >= 4 ? "trung bình" : "không hấp dẫn cho người thuê";
      lines.push(`Gross yield ${i.grossYield.toFixed(1)}%/năm — ${verdict}.`);
    }
    if (i?.activeRentListings) {
      lines.push(`Hiện có ${i.activeRentListings} tin cho thuê đang rao trong dự án — thị trường ${i.activeRentListings > 10 ? "khá sôi động" : "còn nhỏ"}.`);
    }
  } else if (q.includes("so với") || q.includes("so sánh")) {
    if (deep.nearby.length > 0) {
      lines.push(`So với cùng khu ${p.city}:`);
      for (const n of deep.nearby.slice(0, 3)) {
        lines.push(`• ${n.name}: ${n.titanScore?.toFixed(1) || "?"}/10 · ${(n.avgPricePerSqm / 1_000_000).toFixed(1)} tr/m²`);
      }
    } else {
      lines.push(`Chưa có đủ dữ liệu so sánh trong khu vực.`);
    }
  } else if (q.includes("rủi ro") || q.includes("risk")) {
    if (i?.riskTags?.length || i?.risks?.length) {
      lines.push(`Rủi ro chính: ${(i.risks || []).slice(0, 3).join("; ") || i.riskTags?.join(", ")}.`);
      if (i.riskScore != null) lines.push(`Risk Score: ${i.riskScore.toFixed(1)}/10.`);
    } else {
      lines.push(`Hệ thống chưa phát hiện rủi ro lớn nào.`);
    }
  } else {
    // Generic
    if (i?.titanScore != null) {
      lines.push(`${p.name} đang có Titan Score ${i.titanScore.toFixed(1)}/10.`);
    }
    if (i?.strengths?.length) {
      lines.push(`Điểm mạnh: ${i.strengths.slice(0, 2).join("; ")}.`);
    }
    if (i?.risks?.length) {
      lines.push(`Cần lưu ý: ${i.risks[0]}.`);
    }
    if (deep.catalysts.length) {
      lines.push(`Catalyst sắp tới: ${deep.catalysts.slice(0, 2).map((c) => c.title).join("; ")}.`);
    }
  }

  if (lines.length === 0) {
    lines.push(`Tôi chưa đủ dữ liệu để trả lời chính xác câu hỏi này. Hãy thử hỏi về giá, ROI, yield, rủi ro hoặc so sánh với dự án khác.`);
  }
  return lines.join("\n");
}

// ============================================================
// Anthropic API call (fetch-based, no SDK)
// ============================================================
async function callClaude(systemPrompt: string, context: string, question: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: `CONTEXT (dữ liệu intel):\n${context}`, cache_control: { type: "ephemeral" } },
          { type: "text", text: `Câu hỏi của user: ${question}` },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.content?.[0]?.text;
  if (typeof text !== "string") throw new Error("Unexpected Claude response shape");
  return text;
}

export async function POST(req: NextRequest) {
  let body: { slug?: string; question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.slug || !body.question) {
    return NextResponse.json({ ok: false, error: "missing_slug_or_question" }, { status: 400 });
  }

  // Trim and limit question length
  const question = String(body.question).slice(0, 500);

  // Load full intel context
  const deep = await getProjectDeepIntel(body.slug);
  if (!deep) {
    return NextResponse.json({ ok: false, error: "project_not_found" }, { status: 404 });
  }

  const context = buildContext(deep);

  let answer: string;
  let source: "ai" | "templated" = "templated";
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      answer = await callClaude(SYSTEM_PROMPT, context, question);
      source = "ai";
    } else {
      answer = templatedAnswer(deep, question);
    }
  } catch (err) {
    console.error("AI chat failed, falling back to templated:", err);
    answer = templatedAnswer(deep, question);
  }

  return NextResponse.json({ ok: true, answer, source });
}
