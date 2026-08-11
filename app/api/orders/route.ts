import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Mengambil semua data pesanan untuk Layar Kasir
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST: Membuat pesanan baru dari Halaman Pelanggan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableNumber, items, totalPrice } = body;

    const newOrder = await prisma.order.create({
      data: {
        tableNumber,
        totalPrice,
        items: {
          create: items.map((item: { name: string; qty: number; price: number }) => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 });
  }
}

// PATCH: Memperbarui status pesanan (Pending -> Memasak -> Selesai)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui status' }, { status: 500 });
  }
}