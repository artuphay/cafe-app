'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Promo {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountVal: number;
  minSpend: number;
  isActive: boolean;
}

export default function ManagePromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountVal, setDiscountVal] = useState('');
  const [minSpend, setMinSpend] = useState('');

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/promos', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, discountType, discountVal, minSpend }),
      });

      if (res.ok) {
        setCode('');
        setDiscountVal('');
        setMinSpend('');
        fetchPromos();
      } else {
        alert('Kode promo sudah ada.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kupon ini?')) return;
    await fetch(`/api/promos?id=${id}`, { method: 'DELETE' });
    fetchPromos();
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header UI/UX Navigasi & Breadcrumb */}
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
              <span className="text-amber-300/80 text-xs font-semibold">Kelola Promo</span>
            </div>

            <h1 className="text-2xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
              </svg>
              <span>Kelola Kupon Diskon & Promo</span>
            </h1>
            <p className="text-sm text-amber-200 mt-1">Buat kode promo diskon untuk pelanggan di meja</p>
          </div>
        </div>

        {/* Form Buat Kupon */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2">➕ Buat Kode Promo Baru</h2>
          <form onSubmit={handleAddPromo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Kode Promo (Huruf Kapital)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                placeholder="Contoh: SENJA10"
                className="w-full p-2.5 rounded-xl border border-stone-300 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Tipe Potongan</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal Tetap (Rp)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                {discountType === 'percentage' ? 'Nilai Persen (%)' : 'Nilai Potongan (Rp)'}
              </label>
              <input
                type="number"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                required
                placeholder={discountType === 'percentage' ? '10' : '10000'}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Minimal Belanja (Rp)</label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                placeholder="0"
                className="w-full p-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-950 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow hover:scale-105 active:scale-95"
              >
                Simpan Kode Promo
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Kupon Aktif */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2">📋 Daftar Kode Promo Aktif</h2>
          {loading ? (
            <p className="text-sm text-stone-500">Memuat kupon...</p>
          ) : promos.length === 0 ? (
            <p className="text-sm text-stone-400">Belum ada kode promo.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 border-b">
                    <th className="p-3">Kode</th>
                    <th className="p-3">Potongan</th>
                    <th className="p-3">Min. Belanja</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((pr) => (
                    <tr key={pr.id} className="border-b hover:bg-stone-50">
                      <td className="p-3 font-bold text-amber-900 font-mono">{pr.code}</td>
                      <td className="p-3 font-semibold">
                        {pr.discountType === 'percentage' ? `${pr.discountVal}%` : `Rp ${pr.discountVal.toLocaleString('id-ID')}`}
                      </td>
                      <td className="p-3">Rp {pr.minSpend.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deletePromo(pr.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs font-bold transition"
                        >
                          Hapus
                        </button>
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