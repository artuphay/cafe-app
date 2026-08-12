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
    return <div className="p-8 text-center text-stone-400">Memuat status pesanan...</div>;
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 text-stone-100 font-sans">
        <div className="bg-stone-800/80 p-8 rounded-2xl text-center shadow-2xl max-w-sm w-full border border-stone-700">
          <p className="text-amber-400 font-bold text-lg mb-2">Belum ada pesanan aktif</p>
          <p className="text-xs text-stone-400 mb-6">Silakan pilih menu dan lakukan pemesanan dari meja terlebih dahulu.</p>
          <Link href="/order?table=1" className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow block">
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
    <div className="min-h-screen bg-stone-900 p-4 text-stone-100 font-sans pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-stone-800/80 border border-stone-700 p-6 rounded-2xl shadow-xl">
          <Link href={`/order?table=${order.tableNumber}`} className="text-xs text-amber-400 underline mb-2 block">
            ← Pesan Menu Tambahan
          </Link>
          <h1 className="text-xl font-bold text-stone-100">Status Pesanan - Meja #{order.tableNumber}</h1>
          <p className="text-xs text-amber-400 font-mono mt-1">ID: {order.id.slice(0, 8)}...</p>
        </div>

        {/* Tracker Progress */}
        <div className="bg-stone-800/80 p-6 rounded-2xl border border-stone-700 shadow-xl">
          <h2 className="text-sm font-bold text-stone-300 mb-6 text-center">Progress Pesanan Anda</h2>
          <div className="flex justify-between items-center relative">
            <div className="absolute top-4 left-4 right-4 h-1 bg-stone-700 z-0"></div>
            <div 
              className="absolute top-4 left-4 h-1 bg-amber-500 z-0 transition-all duration-500"
              style={{ width: `${(currentStep / 2) * 90}%` }}
            ></div>

            {steps.map((st, idx) => {
              const isDone = idx <= currentStep;
              return (
                <div key={st} className="relative z-10 flex flex-col items-center">
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow transition-all ${
                      isDone ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-700 text-stone-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-xs mt-2 font-bold ${isDone ? 'text-amber-400' : 'text-stone-500'}`}>
                    {st === 'Pending' ? 'Diterima' : st === 'Memasak' ? 'Dimasak' : 'Selesai'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Pesanan */}
        <div className="bg-stone-800/80 p-6 rounded-2xl border border-stone-700 shadow-xl space-y-3">
          <h3 className="font-bold text-amber-400 border-b border-stone-700 pb-2 text-sm">Rincian Item Dipesan</h3>
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm py-1 border-b border-stone-700/50">
              <div>
                <span className="font-semibold text-stone-200">{it.qty}x {it.name}</span>
                {it.notes && <p className="text-xs text-amber-300 italic mt-0.5">Catatan: "{it.notes}"</p>}
              </div>
              <span className="font-bold text-stone-100">Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
            </div>
          ))}

          {hasDiscount && (
            <div className="pt-2 space-y-1 text-xs border-b border-stone-700/50 pb-2">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal Item</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-400">
                <span>Diskon Promo ({order.promoCode || 'PROMO'})</span>
                <span>-Rp {order.discountAmount?.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          <div className="pt-1 flex justify-between items-center font-bold text-sm text-stone-300">
            <span>Metode Pembayaran</span>
            <span className="bg-amber-900/60 border border-amber-700/50 text-amber-300 px-3 py-1 rounded-lg text-xs font-bold">{order.paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center font-extrabold text-base pt-2 text-amber-400 border-t border-stone-700">
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
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Memuat...</div>}>
      <StatusContent />
    </Suspense>
  );
}