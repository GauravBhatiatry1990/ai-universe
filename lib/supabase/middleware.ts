import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfigured } from './env';

export async function updateSessionCookie(
  request: NextRequest
): Promise<{ response: NextResponse; user: User | null }> {
  if (!supabaseConfigured) {
    return { response: NextResponse.next({ request }), user: null };
  }

  // `@supabase/ssr` >= 0.12 no longer ships createMiddlewareClient; the proxy
  // refreshes the session with createServerClient and a request/response
  // cookie adapter (official Supabase + Next 16 proxy pattern).
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        );
      },
    },
  });

  // Refresh-token rotation happens here; must immediately follow client creation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}