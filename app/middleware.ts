import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cek apakah cookie sesi login 'user_session' ada
  const session = request.cookies.get('user_session');

  // Jika belum login dan mencoba mengakses /admin atau /cashier, blokir & alihkan ke /login
  if (!session || !session.value) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Tentukan rute yang wajib dilindungi
export const config = {
  matcher: ['/admin', '/admin/:path*', '/cashier', '/cashier/:path*'],
};