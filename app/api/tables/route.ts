export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: 'asc' },
    });
    return NextResponse.json(tables);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data meja' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableNumber } = body;

    if (!tableNumber) {
      return NextResponse.json({ error: 'Nomor meja wajib diisi' }, { status: 400 });
    }

    const newTable = await prisma.table.create({
      data: { tableNumber: String(tableNumber) },
    });

    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Nomor meja sudah ada atau gagal dibuat' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    await prisma.table.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus meja' }, { status: 500 });
  }
}