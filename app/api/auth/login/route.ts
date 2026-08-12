import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Otomatis buat akun Admin & Kasir bawaan jika database user masih kosong
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      await prisma.user.createMany({
        data: [
          {
            username: 'admin',
            password: 'admin123',
            role: 'admin',
          },
          {
            username: 'kasir',
            password: 'kasir123',
            role: 'cashier',
          },
        ],
      });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set('user_session', JSON.stringify({ id: user.id, username: user.username, role: user.role }), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}