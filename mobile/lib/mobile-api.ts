import { supabase } from './supabase';

export type MobileApiAction =
  | 'get_home_feed'
  | 'search_listings'
  | 'get_listing_detail'
  | 'get_projects'
  | 'get_project_detail'
  | 'get_packages'
  | 'create_payment_order'
  | 'get_payment_order'
  | 'get_favorites'
  | 'toggle_favorite'
  | 'get_profile_stats'
  | 'get_my_listings'
  | 'create_listing';

export async function invokeMobileApi<T>(action: MobileApiAction, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('mobile-api', {
    body: { action, ...payload },
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Mobile API error');
  return data.data as T;
}
