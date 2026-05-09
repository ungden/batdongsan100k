import type { ProjectIntel } from "@/lib/queries/projects";

interface Props {
  intel: ProjectIntel;
}

const RISK_TAG_LABEL: Record<string, { label: string; severity: 'high' | 'medium' | 'low'; explain: string }> = {
  price_overheated: {
    label: "Giá đã tăng nóng",
    severity: 'high',
    explain: "CAGR > 20%/năm — giá có thể đang cao hơn giá trị nội tại, rủi ro điều chỉnh ngắn hạn.",
  },
  supply_glut: {
    label: "Áp lực nguồn cung thứ cấp",
    severity: 'medium',
    explain: "Có nhiều tin rao bán cùng lúc trong dự án — cạnh tranh lớn, có thể ảnh hưởng giá thanh khoản.",
  },
  legal_pending: {
    label: "Pháp lý chưa hoàn thiện",
    severity: 'high',
    explain: "Sổ hồng / sổ đỏ chưa cấp. Cần kiểm tra HĐMB và tiến độ pháp lý trước khi xuống tiền.",
  },
  low_data: {
    label: "Dữ liệu giao dịch ít",
    severity: 'low',
    explain: "Số tin đăng và giao dịch chưa nhiều — đánh giá có thể chưa đại diện cho thị trường thật.",
  },
  price_declining: {
    label: "Xu hướng giá giảm",
    severity: 'high',
    explain: "Giá trung bình đang đi xuống. Nên chờ tín hiệu hồi phục trước khi mua đầu tư.",
  },
};

const SEVERITY_COLOR = {
  high: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: 'error' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'warning' },
  low: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: 'info' },
};

export default function RiskDashboard({ intel }: Props) {
  const score = intel.riskScore ?? 0;
  const scoreColor = score > 6 ? 'text-rose-600' : score > 4 ? 'text-amber-600' : 'text-emerald-600';
  const scoreBg = score > 6 ? 'bg-rose-50 border-rose-200' : score > 4 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200';

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-600">warning</span>
          Risk Dashboard
        </h3>
        <div className={`px-3 py-1.5 rounded-xl border ${scoreBg}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Risk Score</span>
          <div className={`text-xl font-black leading-none ${scoreColor}`}>{score.toFixed(1)} <span className="text-xs font-bold opacity-70">/10</span></div>
        </div>
      </div>

      {intel.riskTags && intel.riskTags.length > 0 ? (
        <div className="space-y-2.5">
          {intel.riskTags.map((tag) => {
            const info = RISK_TAG_LABEL[tag];
            const sev = info?.severity || 'low';
            const c = SEVERITY_COLOR[sev];
            return (
              <div key={tag} className={`flex gap-3 rounded-xl p-3 border ${c.bg} ${c.border}`}>
                <span className={`material-symbols-outlined text-[20px] ${c.text}`}>{c.icon}</span>
                <div>
                  <div className={`font-bold text-sm ${c.text}`}>{info?.label || tag}</div>
                  <p className="text-xs text-on-surface mt-0.5 leading-relaxed">{info?.explain || `Risk tag: ${tag}`}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant text-center py-6">Chưa phát hiện rủi ro lớn nào.</p>
      )}

      {intel.risks && intel.risks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-outline-variant/15">
          <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Lưu ý chung</div>
          <ul className="space-y-1.5 text-sm text-on-surface">
            {intel.risks.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-on-surface-variant">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
