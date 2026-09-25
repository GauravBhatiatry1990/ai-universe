import { getBrowserClient } from './supabase/client';

export async function upsertReview(input: {
  slug: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'You must be signed in to write a review.' };
  const { error } = await supabase.from('reviews').upsert(
    {
      user_id: user.id,
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