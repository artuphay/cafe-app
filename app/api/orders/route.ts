export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      return NextResponse.json(order);
    }

    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableNumber, items, totalPrice, discountAmount, promoCode, paymentMethod, customerName, customerPhone } = body;

    let customerId = null;

    if (customerPhone && customerPhone.trim() !== '') {
      const cleanPhone = customerPhone.trim();
      const cleanName = customerName?.trim() || 'Pelanggan Setia';

      const existingCustomer = await prisma.customer.findUnique({
        where: { phone: cleanPhone },
      });

      if (existingCustomer) {
        const updatedCustomer = await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            name: cleanName,
            totalOrders: existingCustomer.totalOrders + 1,
            totalSpent: existingCustomer.totalSpent + Number(totalPrice),
          },
        });
        customerId = updatedCustomer.id;
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            phone: cleanPhone,
            name: cleanName,
            totalOrders: 1,
            totalSpent: Number(totalPrice),
          },
        });
        customerId = newCustomer.id;
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        tableNumber,
        totalPrice: Number(totalPrice),
        discountAmount: Number(discountAmount || 0),
        promoCode: promoCode || '',
        paymentMethod: paymentMethod || 'Cash',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        customerId,
        items: {
          create: items.map((item: { name: string; qty: number; price: number; notes?: string }) => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
            notes: item.notes || '',
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