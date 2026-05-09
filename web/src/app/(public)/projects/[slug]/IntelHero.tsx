"use client";

import Link from "next/link";
import type { ProjectSummary } from "@/lib/queries/projects";
import WatchProjectButton from "@/components/WatchProjectButton";

interface Props {
  project: ProjectSummary;
}

function scoreColor(score: number | null): { bg: string; text: string; border: string } {
  if (score == null) return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' };
  if (score >= 8) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (score >= 6.5) return { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' };
  if (score >= 5) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
}

function scoreLabel(score: number | null): string {
  if (score == null) return "—";
  if (score >= 8) return "Rất tốt";
  if (score >= 6.5) return "Tốt";
  if (score >= 5) return "Trung bình";
  return "Cần xem xét";
}

export default function IntelHero({ project }: Props) {
  const intel = project.intel;
  const titan = scoreColor(intel?.titanScore ?? null);
  const investment = scoreColor(intel?.investmentScore ?? null);
  const rental = scoreColor(intel?.rentalScore ?? null);
  const living = scoreColor(intel?.livingScore ?? null);

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ScoreCard label="Titan Score" score={intel?.titanScore ?? null} color={titan} note={scoreLabel(intel?.titanScore ?? null)} icon="auto_awesome" />
        <ScoreCard label="Đầu tư" score={intel?.investmentScore ?? null} color={investment} note="dài hạn" icon="trending_up" />
        <ScoreCard label="Cho thuê" score={intel?.rentalScore ?? null} color={rental} note="yield + thanh khoản" icon="key" />
        <ScoreCard label="Để ở" score={intel?.livingScore ?? null} color={living} note="pháp lý + tiện ích" icon="home" />
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="ROI từ mở bán" value={intel?.roiFromLaunch != null ? `${intel.roiFromLaunch > 0 ? '+' : ''}${Math.round(intel.roiFromLaunch)}%` : "—"} positive={intel?.roiFromLaunch != null && intel.roiFromLaunch > 0} />
        <Stat label="12 tháng" value={intel?.priceChange12m != null ? `${intel.priceChange12m > 0 ? '+' : ''}${intel.priceChange12m.toFixed(1)}%` : "—"} positive={intel?.priceChange12m != null && intel.priceChange12m > 0} />
        <Stat label="Yield" value={intel?.grossYield != null ? `${intel.grossYield.toFixed(1)}%` : "—"} />
        <Stat label="Thanh khoản" value={intel?.liquidityScore != null ? `${intel.liquidityScore.toFixed(1)}/10` : "—"} />
      </div>

      {/* CTAs */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/listings?q=${encodeURIComponent(project.name)}&category=sale`}
          className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-[16px]">sell</span>
          Xem căn đang bán
        </Link>
        <Link
          href={`/listings?q=${encodeURIComponent(project.name)}&category=rent`}
          className="inline-flex items-center gap-1.5 bg-white text-on-surface text-sm font-bold px-4 py-2 rounded-xl border border-outline-variant/30 hover:border-primary/40"
        >
          <span className="material-symbols-outlined text-[16px]">key</span>
          Cho thuê
        </Link>
        <Link
          href={`/compare/projects?slugs=${project.slug}`}
          className="inline-flex items-center gap-1.5 bg-white text-on-surface text-sm font-bold px-4 py-2 rounded-xl border border-outline-variant/30 hover:border-primary/40"
        >
          <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
          So sánh
        </Link>
        <Link
          href={`/market-overview?intel=${project.slug}`}
          className="inline-flex items-center gap-1.5 bg-white text-primary text-sm font-bold px-4 py-2 rounded-xl border border-primary/30 hover:bg-primary/5"
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          AI Deep Research
        </Link>
        <WatchProjectButton projectId={project.id} projectName={project.name} />
      </div>
    </div>
  );
}

function ScoreCard({ label, score, color, note, icon }: { label: string; score: number | null; color: { bg: string; text: string; border: string }; note: string; icon: string }) {
  return (
    <div className={`rounded-xl p-3 border ${color.bg} ${color.border}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${color.text} opacity-80`}>{label}</span>
        <span className={`material-symbols-outlined text-[14px] ${color.text}`}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black ${color.text} leading-none`}>{score != null ? score.toFixed(1) : "—"}</span>
        <span className={`text-xs font-bold ${color.text} opacity-70`}>/10</span>
      </div>
      <div className={`text-[10px] mt-1 ${color.text} opacity-70`}>{note}</div>
    </div>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className={`text-lg font-black mt-0.5 ${positive ? 'text-emerald-600' : 'text-on-surface'}`}>{value}</div>
    </div>
  );
}
