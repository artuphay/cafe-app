'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StoreSettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [footerText, setFooterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setStoreName(data.storeName || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setFooterText(data.footerText || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, address, phone, footerText }),
      });

      if (res.ok) {
        alert('Pengaturan kafe berhasil diperbarui!');
      } else {
        alert('Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header dengan UI/UX Navigasi & Breadcrumb Vektor */}
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
              <span className="text-amber-300/80 text-xs font-semibold">Pengaturan Identitas</span>
            </div>

            <h1 className="text-2xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Pengaturan Identitas Kafe</span>
            </h1>
            <p className="text-sm text-amber-200 mt-1">Ubah nama kafe, alamat, kontak, dan teks cetak struk</p>
          </div>
        </div>

        {/* Form Pengaturan */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          {loading ? (
            <p className="text-sm text-stone-500">Memuat pengaturan...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Nama Kafe</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  placeholder="Contoh: Kopi Artuphay"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Alamat Kafe</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Kebon Sirih No. 12, Jakarta"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Nomor Telepon / Kontak</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Pesan Kaki Struk (Footer Struk)</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Contoh: Terima kasih atas kunjungan Anda!"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-amber-900 hover:bg-amber-950 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow disabled:bg-stone-400 hover:scale-105 active:scale-95"
              >
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}