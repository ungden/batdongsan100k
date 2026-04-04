"use client";

import { useSaved } from "@/components/SavedContext";

interface SaveButtonProps {
  propertyId: string;
  className?: string;
  showText?: boolean;
}

export default function SaveButton({ propertyId, className = "", showText = false }: SaveButtonProps) {
  const { savedIds, userId, loading, toggle } = useSaved();
  const isSaved = savedIds.has(propertyId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      alert("Vui lòng đăng nhập để lưu tin");
      return;
    }
    await toggle(propertyId);
  };

  if (loading) {
    return (
      <button
        className={`flex items-center justify-center ${className}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <span className="material-symbols-outlined text-[18px] opacity-50">favorite_border</span>
        {showText && <span className="ml-1 opacity-50 text-sm">Lưu</span>}
      </button>
    );
  }

  return (
    <button
      className={`flex items-center justify-center transition-all ${isSaved ? "text-error" : "text-on-surface-variant hover:text-error"} ${className}`}
      onClick={handleClick}
      title={isSaved ? "Bỏ lưu tin" : "Lưu tin"}
    >
      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
        favorite
      </span>
      {showText && <span className={`ml-1 text-sm ${isSaved ? "font-bold" : ""}`}>{isSaved ? "Đã lưu" : "Lưu"}</span>}
    </button>
  );
}
