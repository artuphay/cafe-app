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
      const res = await fetch('/api/orders');
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

  // Live Auto-Update data setiap 3 detik
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  // Kalkulasi Ringkasan Penjualan
  const completedOrders = orders.filter((o) => o.status === 'Selesai');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalTransactions = completedOrders.length;
  const avgTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  // Kalkulasi Menu Terlaris
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-amber-950 text-white p-6 rounded-2xl shadow-lg">
          <div>
            <Link href="/" className="text-xs text-amber-200 underline mb-1 block">← Kembali ke Beranda</Link>
            <h1 className="text-2xl font-bold">Dashboard Penjualan & Laporan Admin</h1>
            <p className="text-sm text-amber-200">Ringkasan performa penjualan kafe terbarui secara langsung</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            {/* Live Update Indicator */}
            <div className="flex items-center gap-2 bg-amber-900/80 px-3 py-1.5 rounded-full border border-amber-700/50 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Update
            </div>

            {/* Tombol Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-md"
            >
              🚪 Logout
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
          {/* Menu Terlaris */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2">🔥 Menu Terlaris</h2>
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

          {/* Tabel Riwayat Transaksi */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2">📋 Riwayat Transaksi</h2>
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