export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const session = cookieStore.get('user_session');

  if (!session || !session.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const userData = JSON.parse(session.value);
    return NextResponse.json({ authenticated: true, user: userData });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}