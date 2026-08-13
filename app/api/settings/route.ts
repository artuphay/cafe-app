export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({ where: { id: '1' } });
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: '1',
          storeName: 'Kopi Artuphay',
          address: 'Jl. Kebon Sirih No. 12, Jakarta',
          phone: '081234567890',
          footerText: 'Terima kasih atas kunjungan Anda!',
          qrisImageUrl: '',
          logoUrl: '',
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat pengaturan' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { storeName, address, phone, footerText, qrisImageUrl, logoUrl } = body;

    const updated = await prisma.storeSettings.upsert({
      where: { id: '1' },
      update: {
        ...(storeName !== undefined && { storeName }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(footerText !== undefined && { footerText }),
        ...(qrisImageUrl !== undefined && { qrisImageUrl }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
      create: { id: '1', storeName, address, phone, footerText, qrisImageUrl, logoUrl },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui pengaturan' }, { status: 500 });
  }
}