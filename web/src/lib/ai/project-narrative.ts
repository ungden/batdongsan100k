/**
 * Generates strengths / weaknesses / risks bullets per project.
 *
 * Currently uses deterministic templates over intel metrics so we can ship
 * without the Anthropic SDK dependency. Swap `generateNarrativeWithAI`
 * (TODO below) when API key + claude-api skill are wired up.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

interface NarrativeInput {
  projectId: string
  name: string
  developer: string | null
  city: string
  district: string
  legalStatus: string | null
  totalUnits: number | null
  rentalYield: number | null
  roiFromLaunch: number | null
  cagrSinceLaunch: number | null
  priceChange12m: number | null
  liquidityScore: number | null
  riskTags: string[]
  catalystCountHigh: number
  activeSale: number
  activeRent: number
}

export interface Narrative {
  strengths: string[]
  weaknesses: string[]
  risks: string[]
}

// ============================================================
// Heuristic templates (deterministic v1)
// ============================================================

export function generateNarrative(x: NarrativeInput): Narrative {
  const strengths: string[] = []
  const weaknesses: string[] = []
  const risks: string[] = []

  // Strengths
  if (x.roiFromLaunch != null && x.roiFromLaunch > 50) {
    strengths.push(`Tăng giá mạnh từ mở bán: +${Math.round(x.roiFromLaunch)}%`)
  }
  if (x.cagrSinceLaunch != null && x.cagrSinceLaunch > 10) {
    strengths.push(`CAGR dài hạn ổn định: ~${x.cagrSinceLaunch.toFixed(1)}%/năm`)
  }
  if (x.rentalYield != null && x.rentalYield >= 4.5) {
    strengths.push(`Lợi suất cho thuê tốt: ${x.rentalYield.toFixed(1)}%/năm`)
  }
  if (x.legalStatus && x.legalStatus.toLowerCase().includes('sổ')) {
    strengths.push(`Pháp lý rõ ràng: ${x.legalStatus}`)
  }
  if (x.liquidityScore != null && x.liquidityScore >= 7) {
    strengths.push(`Thanh khoản cao, dễ mua bán/cho thuê lại`)
  }
  if (x.catalystCountHigh >= 2) {
    strengths.push(`Có ${x.catalystCountHigh} catalyst lớn sắp tới hỗ trợ tăng giá`)
  }
  if (x.totalUnits && x.totalUnits >= 5000) {
    strengths.push(`Quy mô lớn (${x.totalUnits.toLocaleString('vi-VN')} căn), tiện ích nội khu phong phú`)
  }
  if (x.developer && (x.developer.includes('Vingroup') || x.developer.includes('Vinhomes') || x.developer.includes('Masterise') || x.developer.includes('Gamuda'))) {
    strengths.push(`Chủ đầu tư uy tín: ${x.developer}`)
  }

  // Weaknesses
  if (x.activeSale > 50) {
    weaknesses.push(`Nguồn cung thứ cấp lớn (${x.activeSale} tin bán đang hoạt động)`)
  }
  if (x.rentalYield != null && x.rentalYield < 3.5) {
    weaknesses.push(`Lợi suất cho thuê thấp hơn trung bình thị trường`)
  }
  if (x.priceChange12m != null && x.priceChange12m < 0) {
    weaknesses.push(`Giá đi xuống 12 tháng qua (${x.priceChange12m.toFixed(1)}%)`)
  }
  if (x.liquidityScore != null && x.liquidityScore < 4) {
    weaknesses.push(`Thanh khoản thấp, có thể khó bán lại nhanh`)
  }
  if (x.catalystCountHigh === 0) {
    weaknesses.push(`Chưa có catalyst lớn nào được xác nhận`)
  }
  if (x.activeRent < 3) {
    weaknesses.push(`Thị trường thuê chưa sôi động (${x.activeRent} tin)`)
  }

  // Risks
  if (x.riskTags.includes('price_overheated')) {
    risks.push(`Giá đã tăng nóng (CAGR > 20%/năm), rủi ro điều chỉnh`)
  }
  if (x.riskTags.includes('supply_glut')) {
    risks.push(`Áp lực cạnh tranh nội khu do nhiều hàng cùng rao`)
  }
  if (x.riskTags.includes('legal_pending')) {
    risks.push(`Pháp lý chưa hoàn thiện, cần kiểm tra kỹ trước khi xuống tiền`)
  }
  if (x.riskTags.includes('low_data')) {
    risks.push(`Dữ liệu giao dịch ít, đánh giá có thể chưa đại diện`)
  }
  if (x.riskTags.includes('price_declining')) {
    risks.push(`Xu hướng giá giảm, cần theo dõi thêm trước khi đầu tư`)
  }
  // Always include 1 generic risk
  risks.push(`Giá rao có thể chênh lệch đáng kể với giá giao dịch thực`)

  return {
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    risks: risks.slice(0, 5),
  }
}

// ============================================================
// Persist narrative to project_intel
// ============================================================

export async function saveNarrative(
  supabase: SupabaseClient,
  projectId: string,
  narrative: Narrative,
): Promise<void> {
  await supabase
    .from('project_intel')
    .update({
      strengths: narrative.strengths,
      weaknesses: narrative.weaknesses,
      risks: narrative.risks,
    })
    .eq('project_id', projectId)
}

// ============================================================
// TODO: AI-powered version (when claude-api skill is wired up)
// ============================================================
//
// export async function generateNarrativeWithAI(client: Anthropic, x: NarrativeInput): Promise<Narrative> {
//   const resp = await client.messages.create({
//     model: 'claude-sonnet-4-6',
//     max_tokens: 800,
//     system: 'Bạn là analyst BĐS của TitanHome. Trả lời JSON đúng schema.',
//     messages: [{
//       role: 'user',
//       content: [
//         { type: 'text', text: 'Cache project metadata...', cache_control: { type: 'ephemeral' } },
//         { type: 'text', text: JSON.stringify(x) },
//       ],
//     }],
//   })
//   return JSON.parse(extractJSON(resp))
// }
