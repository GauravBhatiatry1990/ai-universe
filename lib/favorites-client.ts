import { getBrowserClient } from './supabase/client';

export async function addFavorite(
  slug: string,
  userId: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, slug });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}

export async function removeFavorite(
  slug: string,
  userId: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('slug', slug);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}