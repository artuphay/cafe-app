'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  updatedAt: string;
}

export default function ManageCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/customers', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-amber-950 text-white p-6 rounded-2xl shadow-lg gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link 
                href="/admin" 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-100 text-xs font-bold border border-amber-700/60 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Dashboard Admin</span>
              </Link>
              <span className="text-amber-500/60 text-xs">•</span>
              <span className="text-amber-300/80 text-xs font-semibold">Pelanggan Setia</span>
            </div>

            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>👥</span>
              <span>Daftar Pelanggan Setia (Repeat Customers)</span>
            </h1>
            <p className="text-sm text-amber-200 mt-1">Lacak frekuensi kunjungan dan total belanja pelanggan kafe Anda</p>
          </div>
        </div>

        {/* Tabel Pelanggan */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-lg font-bold text-amber-950">📋 Riwayat Pelanggan (Peringkat Belanja)</h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Cari nama atau WhatsApp..."
              className="p-2.5 rounded-xl border border-stone-300 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-amber-800"
            />
          </div>

          {loading ? (
            <p className="text-sm text-stone-500">Memuat data pelanggan...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-stone-400">Belum ada pelanggan terdaftar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 border-b">
                    <th className="p-3">Nama Pelanggan</th>
                    <th className="p-3">WhatsApp / HP</th>
                    <th className="p-3">Total Kunjungan</th>
                    <th className="p-3">Total Belanja (Rp)</th>
                    <th className="p-3">Kunjungan Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, index) => (
                    <tr key={c.id} className="border-b hover:bg-stone-50">
                      <td className="p-3 font-bold text-amber-950 flex items-center gap-2">
                        {index === 0 && <span className="text-amber-500 text-xs">👑 #1</span>}
                        <span>{c.name}</span>
                      </td>
                      <td className="p-3 font-mono text-stone-600">{c.phone}</td>
                      <td className="p-3 font-bold">
                        <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-xs">
                          {c.totalOrders}x Pesan
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-800">Rp {c.totalSpent.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-xs text-stone-500">
                        {new Date(c.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
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
  );
}