'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'Pending' | 'Memasak' | 'Selesai';
  createdAt: string;
}

export default function CashierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('Semua');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Gagal memuat pesanan:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // Polling otomatis setiap 3 detik
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, newStatus: 'Pending' | 'Memasak' | 'Selesai') => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      alert('Gagal memperbarui status');
    }
  };

  const filteredOrders = filter === 'Semua' 
    ? orders 
    : orders.filter((ord) => ord.status === filter);

  const totalIncome = orders
    .filter((ord) => ord.status === 'Selesai')
    .reduce((sum, ord) => sum + ord.totalPrice, 0);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-amber-900 text-white p-6 rounded-2xl shadow-lg">
          <div>
            <Link href="/" className="text-xs text-amber-200 underline mb-1 block">← Kembali ke Beranda</Link>
            <h1 className="text-2xl font-bold">Layar Kasir & Dapur (Real-Time Database)</h1>
            <p className="text-sm text-amber-200">Terhubung langsung dengan pesanan pelanggan dari meja</p>
          </div>
          <div className="mt-4 md:mt-0 bg-amber-800 px-4 py-2.5 rounded-xl text-right">
            <span className="text-xs text-amber-200 block">Total Pendapatan Selesai</span>
            <span className="text-xl font-extrabold text-white">Rp {totalIncome.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="flex gap-2 bg-white p-3 rounded-xl border border-stone-200 shadow-sm overflow-x-auto">
          {['Semua', 'Pending', 'Memasak', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                filter === st
                  ? 'bg-amber-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st} ({st === 'Semua' ? orders.length : orders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500 font-medium">Belum ada pesanan masuk.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-stone-100">
                    <div>
                      <span className="text-xs font-bold text-stone-400 block">
                        {new Date(ord.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h2 className="text-xl font-extrabold text-amber-950">Meja #{ord.tableNumber}</h2>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'Pending'
                          ? 'bg-red-100 text-red-700'
                          : ord.status === 'Memasak'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {ord.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-sm">
                        <span><strong className="text-amber-900">{it.qty}x</strong> {it.name}</span>
                        <span className="text-stone-500">Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center font-bold text-base py-3 border-t border-stone-100 mb-4">
                    <span>Total Harga</span>
                    <span className="text-amber-900">Rp {ord.totalPrice.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex gap-2">
                    {ord.status === 'Pending' && (
                      <button
                        onClick={() => updateStatus(ord.id, 'Memasak')}
                        className="w-full bg-amber-800 hover:bg-amber-900 text-white py-2.5 rounded-xl font-bold text-sm transition"
                      >
                        Terima & Masak
                      </button>
                    )}
                    {ord.status === 'Memasak' && (
                      <button
                        onClick={() => updateStatus(ord.id, 'Selesai')}
                        className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-bold text-sm transition"
                      >
                        Tandai Selesai
                      </button>
                    )}
                    {ord.status === 'Selesai' && (
                      <button
                        disabled
                        className="w-full bg-stone-200 text-stone-500 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed"
                      >
                        Transaksi Selesai ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}