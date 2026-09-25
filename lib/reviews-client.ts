import { getBrowserClient } from './supabase/client';

export async function upsertReview(input: {
  userId: string;
  slug: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const { error } = await supabase.from('reviews').upsert(
    {
      user_id: input.userId,
      slug: input.slug,
      rating: input.rating,
      comment: input.comment,
    },
    { onConflict: 'user_id,slug' }
  );
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}

export async function deleteReview(
  id: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: '' };
}