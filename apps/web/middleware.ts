import { NextResponse } from 'next/server';

export function middleware() {
  // Since we're using localStorage, we can't check token in middleware (server-side)
  // The authentication check will be handled client-side in AuthContext
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*', '/profiles/:path*', '/roles/:path*'],
};
