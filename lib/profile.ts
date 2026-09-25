import { getServerClient } from './supabase/server';

export async function getProfile(
  userId: string
): Promise<{ display_name: string }> {
  const supabase = await getServerClient();
  if (!supabase) return { display_name: '' };
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .limit(1)
    .returns<{ display_name: string }[]>();
  if (error || !data || data.length === 0) return { display_name: '' };
  return { display_name: data[0].display_name };
}