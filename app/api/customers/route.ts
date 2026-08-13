export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { totalSpent: 'desc' },
      include: { orders: { select: { id: true, createdAt: true, totalPrice: true } } },
    });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pelanggan' }, { status: 500 });
  }
}