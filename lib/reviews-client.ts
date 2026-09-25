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
  if (error) {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    console.warn('[BUG2-DIAGNOSTIC] review upsert failed', {
      message: error.message,
      code: error.code,
      sessionPresent: Boolean(session),
      tokenExpired: session ? Date.now() >= (session.expires_at ?? 0) * 1000 : null,
      sbCookies:
        typeof document !== 'undefined'
          ? document.cookie
              .split(';')
              .map((c) => c.split('=')[0].trim())
              .filter((n) => n.includes('sb-'))
          : [],
    });
    return { ok: false, message: error.message };
  }
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