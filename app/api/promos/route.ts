export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const promo = await prisma.promo.findUnique({
        where: { code: code.toUpperCase() },
      });
      if (!promo || !promo.isActive) {
        return NextResponse.json({ error: 'Kode promo tidak valid atau kadaluarsa' }, { status: 404 });
      }
      return NextResponse.json(promo);
    }

    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(promos);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data promo' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, discountType, discountVal, minSpend } = body;

    const newPromo = await prisma.promo.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountVal: Number(discountVal),
        minSpend: Number(minSpend || 0),
      },
    });

    return NextResponse.json(newPromo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Kode promo sudah ada atau gagal dibuat' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    await prisma.promo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus promo' }, { status: 500 });
  }
}