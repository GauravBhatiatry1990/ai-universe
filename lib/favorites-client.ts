import { getBrowserClient } from './supabase/client';

export async function addFavorite(
  slug: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const { error } = await supabase.from('favorites').insert({ slug });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}

export async function removeFavorite(
  slug: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const { error } = await supabase.from('favorites').delete().eq('slug', slug);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}