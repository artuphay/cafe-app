export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua menu (Otomatis Seed data awal jika kosong)
export async function GET() {
  try {
    const count = await prisma.product.count();
    if (count === 0) {
      await prisma.product.createMany({
        data: [
          { name: 'Kopi Susu Senja', category: 'Minuman', price: 22000, description: 'Espresso dengan gula aren dan susu segar' },
          { name: 'Americano', category: 'Minuman', price: 18000, description: 'Espresso ganda dengan air panas/es' },
          { name: 'Matcha Latte', category: 'Minuman', price: 25000, description: 'Matcha Jepang dengan susu UHT' },
          { name: 'Nasi Goreng Spesial', category: 'Makanan', price: 32000, description: 'Nasi goreng dengan telur, ayam, dan kerupuk' },
          { name: 'Croissant Cokelat', category: 'Dessert', price: 20000, description: 'Roti croissant renyah isi cokelat lumer' },
        ],
      });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}

// POST: Tambah menu baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, price, description } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        price: Number(price),
        description,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah menu' }, { status: 500 });
  }
}

// PATCH: Edit menu atau ubah status ketersediaan
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, price, description, isAvailable } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price: Number(price) }),
        ...(description !== undefined && { description }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengubah menu' }, { status: 500 });
  }
}

// DELETE: Hapus menu
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus menu' }, { status: 500 });
  }
}