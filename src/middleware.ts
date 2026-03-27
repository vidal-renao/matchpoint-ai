import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const LOCALES = ['es', 'en', 'de'];
const PROTECTED_SEGMENTS = ['/upload', '/profile', '/matches', '/applications'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  // Detect locale prefix
  const segments = pathname.split('/');
  const locale = LOCALES.includes(segments[1]) ? segments[1] : 'es';
  const pathWithoutLocale = '/' + segments.slice(2).join('/');

  // Refresh session cookies (required by @supabase/ssr)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_SEGMENTS.some(s => pathWithoutLocale.startsWith(s));
  if (isProtected && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  const isAuthPage = pathWithoutLocale === '/login' || pathWithoutLocale === '/signup';
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL(`/${locale}/matches`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
