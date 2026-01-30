import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register'];
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/auth')
  );

  // Allow public routes
  if (isPublicRoute) {
    // If user is logged in and tries to access auth pages, redirect to dashboard
    if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  const userRole = token.role as string;

  // Organization-only routes
  if (pathname.startsWith('/dashboard/hackathons/create') && userRole !== 'organization') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Participant-only routes (IDE)
  if (pathname.startsWith('/dashboard/ide') && userRole !== 'participant') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Contributor-only routes (Projects marketplace)
  if (pathname.startsWith('/dashboard/projects') && userRole !== 'contributor' && userRole !== 'participant') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
};
