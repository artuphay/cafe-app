import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Periksa apakah cookie sesi login ada
  const session = request.cookies.get('user_session');

  // Jika belum login dan mencoba mengakses /admin atau /cashier
  if (!session || !session.value) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang wajib terlindungi login
export const config = {
  matcher: ['/admin', '/admin/:path*', '/cashier', '/cashier/:path*'],
};