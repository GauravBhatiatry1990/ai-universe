import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSessionCookie } from './lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSessionCookie(request);
  if (request.nextUrl.pathname.startsWith('/account') && !user) {
    return NextResponse.redirect(new URL('/login?next=/account', request.url));
  }
  return response;
}

export const config = {
  matcher:
    '/((?!_next/static|_next/image|favicon\\.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
};