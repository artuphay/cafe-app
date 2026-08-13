'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StoreSettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [footerText, setFooterText] = useState('');
  const [qrisImageUrl, setQrisImageUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setStoreName(data.storeName || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setFooterText(data.footerText || '');
        setQrisImageUrl(data.qrisImageUrl || '');
        setLogoUrl(data.logoUrl || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const SIZE = 200;
        let width = img.width;
        let height = img.height;

        const minSide = Math.min(width, height);
        const startX = (width - minSide) / 2;
        const startY = (height - minSide) / 2;

        canvas.width = SIZE;
        canvas.height = SIZE;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, SIZE, SIZE);
          const compressed = canvas.toDataURL('image/png', 0.9);
          setLogoUrl(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setQrisImageUrl(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, address, phone, footerText, qrisImageUrl, logoUrl }),
      });

      if (res.ok) {
        alert('Pengaturan kafe & Logo berhasil diperbarui!');
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
    <div className="min-h-screen bg-stone-100 text-stone-800 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
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
              <span>⚙️</span>
              <span>Pengaturan Identitas & Logo Kafe</span>
            </h1>
            <p className="text-sm text-amber-200 mt-1">Ubah logo kafe, nama, alamat, kontak, dan poster QRIS</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          {loading ? (
            <p className="text-sm text-stone-500">Memuat pengaturan...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Unggah Logo Kafe */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <label className="block text-xs font-bold text-amber-950">Unggah Logo Kafe (Icon Header)</label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border border-amber-300 shadow" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center font-bold text-2xl shadow">
                      ☕
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-900 file:text-white hover:file:bg-amber-950 cursor-pointer border border-stone-300 rounded-xl p-1 flex-1"
                  />
                </div>
              </div>

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

              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-600 mb-1">Unggah Poster QRIS Resmi Kafe</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrisUpload}
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer border border-stone-300 rounded-xl p-1"
                />
                {qrisImageUrl && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-900">Pratinjau Poster QRIS Aktif:</p>
                    <img src={qrisImageUrl} alt="Poster QRIS" className="w-48 mx-auto rounded-xl shadow-md border border-amber-300" />
                  </div>
                )}
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