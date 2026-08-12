'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  totalPrice: number;
  discountAmount?: number;
  promoCode?: string;
  paymentMethod: string;
  status: 'Pending' | 'Memasak' | 'Selesai';
  createdAt: string;
}

function StatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return <div className="p-8 text-center text-stone-600">Memuat status pesanan...</div>;
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 text-stone-800">
        <div className="bg-white p-8 rounded-2xl text-center shadow-md max-w-sm w-full border border-stone-200">
          <p className="text-amber-900 font-bold text-lg mb-2">Belum ada pesanan aktif</p>
          <p className="text-xs text-stone-500 mb-6">Silakan pilih menu dan lakukan pemesanan dari meja terlebih dahulu.</p>
          <Link href="/order?table=1" className="bg-amber-900 hover:bg-amber-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow block">
            Pesan Menu Sekarang
          </Link>
        </div>
      </div>
    );
  }

  const steps = ['Pending', 'Memasak', 'Selesai'];
  const currentStep = steps.indexOf(order.status);
  const subtotal = order.items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const hasDiscount = order.discountAmount && order.discountAmount > 0;

  return (
    <div className="min-h-screen bg-stone-100 p-4 text-stone-800 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-amber-950 text-white p-6 rounded-2xl shadow-lg">
          <Link href={`/order?table=${order.tableNumber}`} className="text-xs text-amber-200 underline mb-2 block">
            ← Pesan Menu Tambahan
          </Link>
          <h1 className="text-xl font-bold">Status Pesanan - Meja #{order.tableNumber}</h1>
          <p className="text-xs text-amber-200 font-mono mt-1">ID: {order.id.slice(0, 8)}...</p>
        </div>

        {/* Status Tracker */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-sm font-bold text-stone-600 mb-6 text-center">Progress Pesanan Anda</h2>
          <div className="flex justify-between items-center relative">
            <div className="absolute top-4 left-4 right-4 h-1 bg-stone-200 z-0"></div>
            <div 
              className="absolute top-4 left-4 h-1 bg-amber-800 z-0 transition-all duration-500"
              style={{ width: `${(currentStep / 2) * 90}%` }}
            ></div>

            {steps.map((st, idx) => {
              const isDone = idx <= currentStep;
              return (
                <div key={st} className="relative z-10 flex flex-col items-center">
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow transition-all ${
                      isDone ? 'bg-amber-900 text-white' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-xs mt-2 font-bold ${isDone ? 'text-amber-950' : 'text-stone-400'}`}>
                    {st === 'Pending' ? 'Diterima' : st === 'Memasak' ? 'Dimasak' : 'Selesai'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Rincian */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <h3 className="font-bold text-amber-950 border-b pb-2 text-sm">Rincian Item Dipesan</h3>
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm py-1 border-b border-stone-100">
              <div>
                <span className="font-semibold text-stone-800">{it.qty}x {it.name}</span>
                {it.notes && <p className="text-xs text-amber-800 italic mt-0.5">Catatan: "{it.notes}"</p>}
              </div>
              <span className="font-bold text-amber-950">Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
            </div>
          ))}

          {/* Rincian Diskon Promo */}
          {hasDiscount && (
            <div className="pt-2 space-y-1 text-xs border-b pb-2">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal Item</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Diskon Promo ({order.promoCode || 'PROMO'})</span>
                <span>-Rp {order.discountAmount?.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          <div className="pt-1 flex justify-between items-center font-bold text-sm">
            <span>Metode Pembayaran</span>
            <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-lg text-xs font-bold">{order.paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center font-extrabold text-base pt-2 text-amber-950 border-t">
            <span>Total Bayar</span>
            <span>Rp {order.totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <StatusContent />
    </Suspense>
  );
}