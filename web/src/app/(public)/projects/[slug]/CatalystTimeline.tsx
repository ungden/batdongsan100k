import type { ProjectCatalyst } from "@/lib/queries/projects";

interface Props {
  catalysts: ProjectCatalyst[];
}

const HORIZON_LABEL: Record<string, string> = {
  short: "Ngắn hạn (0–12 tháng)",
  medium: "Trung hạn (1–3 năm)",
  long: "Dài hạn (3–5 năm)",
};

const CATEGORY_ICON: Record<string, string> = {
  infrastructure: "construction",
  legal: "gavel",
  economic: "monitoring",
  commercial: "storefront",
};

const CATEGORY_LABEL: Record<string, string> = {
  infrastructure: "Hạ tầng",
  legal: "Pháp lý",
  economic: "Kinh tế",
  commercial: "Thương mại",
};

const IMPACT_COLOR: Record<string, string> = {
  high: "bg-indigo-50 text-indigo-700 border-indigo-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
};

const STATUS_COLOR: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  rumor: "bg-amber-50 text-amber-700",
  speculative: "bg-slate-100 text-slate-600",
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Xác nhận",
  rumor: "Đang đồn",
  speculative: "Có thể",
};

export default function CatalystTimeline({ catalysts }: Props) {
  if (catalysts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-outline-variant/20 p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">bolt</span>
        <p className="text-sm text-on-surface-variant">Chưa ghi nhận catalyst nào cho dự án này.</p>
      </div>
    );
  }

  // Group by horizon
  const grouped: Record<string, ProjectCatalyst[]> = { short: [], medium: [], long: [] };
  for (const c of catalysts) grouped[c.horizon]?.push(c);

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
      <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-indigo-600">bolt</span>
        Catalyst Timeline
        <span className="text-[11px] font-medium text-on-surface-variant ml-auto">{catalysts.length} sự kiện</span>
      </h3>

      <div className="space-y-5">
        {(["short", "medium", "long"] as const).map((h) => {
          const items = grouped[h];
          if (!items || items.length === 0) return null;
          return (
            <div key={h}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">{HORIZON_LABEL[h]}</div>
              <div className="space-y-3">
                {items.map((c) => (
                  <div key={c.id} className="flex gap-3 group">
                    <div className="w-10 shrink-0 text-center pt-1">
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{CATEGORY_ICON[c.category] || "event"}</span>
                      {c.expectedDate && <div className="text-[10px] text-on-surface-variant font-bold mt-0.5">{c.expectedDate.slice(0, 4)}</div>}
                    </div>
                    <div className="flex-1 border-l-2 border-outline-variant/20 pl-3 pb-2">
                      <div className="font-bold text-sm text-on-surface">{c.title}</div>
                      {c.description && <div className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{c.description}</div>}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${IMPACT_COLOR[c.impact]}`}>
                          Impact {c.impact}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {CATEGORY_LABEL[c.category] || c.category}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status]}`}>
                          {STATUS_LABEL[c.status] || c.status}
                        </span>
                        {c.sourceUrl && (
                          <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">
                            Nguồn ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
