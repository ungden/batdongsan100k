"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface SaveButtonProps {
  propertyId: string;
  className?: string;
  showText?: boolean;
}

export default function SaveButton({ propertyId, className = "", showText = false }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          const { data } = await supabase
            .from("saved_listings")
            .select("user_id")
            .eq("user_id", user.id)
            .eq("listing_id", propertyId)
            .single();
            
          if (data) {
            setIsSaved(true);
          }
        }
      } catch (error) {
        // Ignored or log error
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [propertyId]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if this is inside a Link
    e.stopPropagation();
    
    if (!user) {
      // Could redirect to login or show toast
      alert("Vui lòng đăng nhập để lưu tin");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (isSaved) {
        await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", propertyId);
        setIsSaved(false);
      } else {
        await supabase
          .from("saved_listings")
          .insert({ user_id: user.id, listing_id: propertyId });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isSaved) {
    return (
      <button 
        className={`flex items-center justify-center ${className}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <span className="material-symbols-outlined text-[18px] opacity-50 animate-pulse">favorite_border</span>
        {showText && <span className="ml-1 opacity-50 text-sm">Lưu</span>}
      </button>
    );
  }

  return (
    <button 
      className={`flex items-center justify-center transition-all ${isSaved ? "text-error" : "text-on-surface-variant hover:text-error"} ${className}`}
      onClick={toggleSave}
      title={isSaved ? "Bỏ lưu tin" : "Lưu tin"}
    >
      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
        favorite
      </span>
      {showText && <span className={`ml-1 text-sm ${isSaved ? "font-bold" : ""}`}>{isSaved ? "Đã lưu" : "Lưu"}</span>}
    </button>
  );
}
