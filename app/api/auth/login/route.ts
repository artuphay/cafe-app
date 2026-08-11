import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Buat akun admin bawaan otomatis jika database user masih kosong
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      await prisma.user.create({
        data: {
          username: 'admin',
          password: 'admin123',
          role: 'admin',
        },
      });
    }

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // Simpan status login di Cookie HTTP-Only
    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set('user_session', JSON.stringify({ id: user.id, username: user.username, role: user.role }), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // Berlaku 1 hari
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}