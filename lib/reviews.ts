import { getServerClient } from './supabase/server';
import { getAgentMeta } from './agentLookup';

export type ReviewRow = {
  id: string;
  slug: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  display_name: string;
};

export type ToolStats = { review_count: number; avg_rating: number | null };

export type MyReview = {
  id: string;
  slug: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type MyReviewWithAgent = MyReview & {
  agentName: string;
  tagline: string;
};

export type LatestReview = {
  id: string;
  slug: string;
  rating: number;
  comment: string;
  created_at: string;
  display_name: string;
};

type ReviewRowRaw = {
  id: string;
  slug: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles: { display_name: string } | null;
};

type MyReviewRaw = {
  id: string;
  slug: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

type LatestReviewRaw = {
  id: string;
  slug: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { display_name: string } | null;
};

function toReviewRow(row: ReviewRowRaw): ReviewRow {
  return {
    id: row.id,
    slug: row.slug,
    rating: row.rating,
    comment: row.comment ?? '',
    created_at: row.created_at,
    updated_at: row.updated_at,
    display_name: row.profiles?.display_name?.trim() ? row.profiles.display_name : 'Anonymous',
  };
}

export async function getReviewsForSlug(
  slug: string,
  limit = 100
): Promise<ReviewRow[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('id, slug, rating, comment, created_at, updated_at, profiles ( display_name )')
    .eq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<ReviewRowRaw[]>();
  if (error || !data) return [];
  return data.map(toReviewRow);
}

export async function getToolStats(slug: string): Promise<ToolStats> {
  const supabase = await getServerClient();
  if (!supabase) return { review_count: 0, avg_rating: null };
  const { data, error } = await supabase
    .from('tool_stats')
    .select('review_count, avg_rating')
    .eq('slug', slug)
    .limit(1)
    .returns<{ review_count: number; avg_rating: number | null }[]>();
  if (error || !data || data.length === 0) return { review_count: 0, avg_rating: null };
  return { review_count: data[0].review_count, avg_rating: data[0].avg_rating };
}

export async function getMyReview(
  slug: string,
  userId: string
): Promise<MyReview | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('reviews')
    .select('id, slug, rating, comment, created_at, updated_at')
    .eq('slug', slug)
    .eq('user_id', userId)
    .limit(1)
    .returns<MyReviewRaw[]>();
  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    id: row.id,
    slug: row.slug,
    rating: row.rating,
    comment: row.comment ?? '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getLatestReviews(limit = 3): Promise<LatestReview[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('id, slug, rating, comment, created_at, profiles ( display_name )')
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<LatestReviewRaw[]>();
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    rating: row.rating,
    comment: row.comment ?? '',
    created_at: row.created_at,
    display_name: row.profiles?.display_name?.trim() ? row.profiles.display_name : 'Anonymous',
  }));
}

export async function getMyReviews(userId: string): Promise<MyReviewWithAgent[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('id, slug, rating, comment, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<MyReviewRaw[]>();
  if (error || !data) return [];
  return data.map((row) => {
    const meta = getAgentMeta(row.slug);
    return {
      id: row.id,
      slug: row.slug,
      rating: row.rating,
      comment: row.comment ?? '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      agentName: meta?.name ?? 'Unknown tool',
      tagline: meta?.tagline ?? '',
    };
  });
}