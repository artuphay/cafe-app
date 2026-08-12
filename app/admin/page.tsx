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
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const completedOrders = orders.filter((o) => o.status === 'Selesai');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalTransactions = completedOrders.length;
  const avgTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  const itemSalesMap: { [name: string]: { qty: number; revenue: number } } = {};
  completedOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!itemSalesMap[item.name]) {
        itemSalesMap[item.name] = { qty: 0, revenue: 0 };
      }
      itemSalesMap[item.name].qty += item.qty;
      itemSalesMap[item.name].revenue += item.qty * item.price;
    });
  });

  const topItems = Object.entries(itemSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-amber-950 text-white p-6 rounded-2xl shadow-lg gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-100 text-xs font-bold border border-amber-700/60 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Beranda Kafe</span>
              </Link>
              <span className="text-amber-500/60 text-xs">•</span>
              <span className="text-amber-300/80 text-xs font-semibold">Dashboard Admin</span>
            </div>
            <h1 className="text-2xl font-bold">Dashboard Penjualan & Laporan Admin</h1>
            <p className="text-sm text-amber-200 mt-1">Ringkasan performa penjualan kafe terbarui secara langsung</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            {/* Kelola Menu */}
            <Link
              href="/admin/products"
              className="bg-amber-800 hover:bg-amber-900 text-amber-100 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Kelola Menu</span>
            </Link>

            {/* QR Code Meja */}
            <Link
              href="/admin/tables"
              className="bg-amber-800 hover:bg-amber-900 text-amber-100 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>QR Code Meja</span>
            </Link>

            {/* Kelola Promo */}
            <Link
              href="/admin/promos"
              className="bg-amber-800 hover:bg-amber-900 text-amber-100 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
              </svg>
              <span>Kelola Promo</span>
            </Link>

            {/* Pengaturan Kafe */}
            <Link
              href="/admin/settings"
              className="bg-amber-800 hover:bg-amber-900 text-amber-100 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Pengaturan Kafe</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <svg className="w-4 h-4 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Ringkasan Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-bold text-stone-400 block uppercase tracking-wider">Total Omzet (Selesai)</span>
            <p className="text-3xl font-extrabold text-amber-900 mt-2">Rp {totalRevenue.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-bold text-stone-400 block uppercase tracking-wider">Transaksi Selesai</span>
            <p className="text-3xl font-extrabold text-amber-900 mt-2">{totalTransactions} Transaksi</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-bold text-stone-400 block uppercase tracking-wider">Rata-Rata per Transaksi</span>
            <p className="text-3xl font-extrabold text-amber-900 mt-2">Rp {avgTransaction.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Menu Terlaris & Tabel Riwayat Transaksi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2 flex items-center gap-2">
              <span>🔥</span> Menu Terlaris
            </h2>
            {topItems.length === 0 ? (
              <p className="text-sm text-stone-400">Belum ada transaksi selesai.</p>
            ) : (
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center text-sm border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-stone-800">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-900 block">{item.qty} Porsi</span>
                      <span className="text-xs text-stone-400">Rp {item.revenue.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2 flex items-center gap-2">
              <span>📋</span> Riwayat Transaksi
            </h2>
            {loading ? (
              <p className="text-sm text-stone-500">Memuat data transaksi...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-stone-400">Belum ada transaksi dalam database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-stone-100 text-stone-600 border-b">
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Meja</th>
                      <th className="p-3">Menu Dipesan</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b hover:bg-stone-50">
                        <td className="p-3 text-xs text-stone-500 whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3 font-bold text-amber-950">Meja #{o.tableNumber}</td>
                        <td className="p-3 text-xs">
                          {o.items.map((it) => `${it.qty}x ${it.name}`).join(', ')}
                        </td>
                        <td className="p-3 font-bold">Rp {o.totalPrice.toLocaleString('id-ID')}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              o.status === 'Pending'
                                ? 'bg-red-100 text-red-700'
                                : o.status === 'Memasak'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}