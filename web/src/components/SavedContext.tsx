"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface SavedContextType {
  savedIds: Set<string>;
  userId: string | null;
  loading: boolean;
  toggle: (propertyId: string) => Promise<void>;
}

const SavedContext = createContext<SavedContextType>({
  savedIds: new Set(),
  userId: null,
  loading: true,
  toggle: async () => {},
});

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        setUserId(user.id);
        const { data } = await supabase
          .from("saved_listings")
          .select("listing_id")
          .eq("user_id", user.id);

        if (data) {
          setSavedIds(new Set(data.map((d: any) => d.listing_id)));
        }
      } catch {
        // no-op
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggle = useCallback(async (propertyId: string) => {
    if (!userId) return;
    const supabase = createClient();
    const isSaved = savedIds.has(propertyId);

    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });

    try {
      if (isSaved) {
        await supabase.from("saved_listings").delete().eq("user_id", userId).eq("listing_id", propertyId);
      } else {
        await supabase.from("saved_listings").insert({ user_id: userId, listing_id: propertyId });
      }
    } catch {
      // Revert on error
      setSavedIds(prev => {
        const next = new Set(prev);
        if (isSaved) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    }
  }, [userId, savedIds]);

  return (
    <SavedContext.Provider value={{ savedIds, userId, loading, toggle }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
