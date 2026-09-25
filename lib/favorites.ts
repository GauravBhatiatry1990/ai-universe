import { getServerClient } from './supabase/server';
import { getAgentMeta } from './agentLookup';
import type { AgentMeta } from './agentLookup';

export type FavoriteAgent = AgentMeta;

export async function getFavoriteSlugs(userId: string): Promise<string[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('slug')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<{ slug: string }[]>();
  if (error || !data) return [];
  return data.map((row) => row.slug);
}

export async function getFavorites(userId: string): Promise<FavoriteAgent[]> {
  const slugs = await getFavoriteSlugs(userId);
  return slugs
    .map((slug) => getAgentMeta(slug))
    .filter((a): a is FavoriteAgent => a !== null);
}

export async function getIsFavorite(slug: string, userId: string): Promise<boolean> {
  const slugs = await getFavoriteSlugs(userId);
  return slugs.includes(slug);
}