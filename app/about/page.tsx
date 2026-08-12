'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [storeName, setStoreName] = useState('Kopi Artuphay');
  const [address, setAddress] = useState('Jl. Kebon Sirih No. 12, Jakarta');
  const [phone, setPhone] = useState('081234567890');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.storeName) setStoreName(data.storeName);
        if (data.address) setAddress(data.address);
        if (data.phone) setPhone(data.phone);
      });
  }, []);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-900/90 border-b border-stone-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-black text-stone-100">{storeName}</Link>
          <nav className="flex items-center gap-6 text-sm font-semibold text-stone-300">
            <Link href="/menu" className="hover:text-amber-400">Menu</Link>
            <Link href="/about" className="text-amber-400">Tentang Kami</Link>
            <Link href="/order?table=1" className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-4 py-2 rounded-xl text-xs font-extrabold">
              Pesan di Meja
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-16 px-6 space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Kisah Kami</span>
          <h1 className="text-3xl md:text-5xl font-black text-stone-50">Tentang {storeName}</h1>
          <p className="text-stone-400 max-w-xl mx-auto text-sm md:text-base">
            Ruang hangat untuk menikmati racikan kopi lokal berkualitas tinggi, sajian makanan lezat, dan suasana nyaman untuk bekerja maupun berkumpul.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-stone-800/50 p-8 rounded-3xl border border-stone-800 shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600" 
            alt="Cafe Interior" 
            className="rounded-2xl object-cover w-full h-64 shadow-lg border border-stone-700/50"
          />
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-stone-100">Kopi Lokal, Kualitas Utama</h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              Kami menyajikan racikan kopi yang terbuat dari 100% biji kopi Arabica lokal pilihan, disangrai dengan cermat untuk menghadirkan aroma dan cita rasa terbaik di setiap cangkirnya.
            </p>
            <div className="pt-2 border-t border-stone-700/60 space-y-2 text-xs text-stone-400">
              <p>📍 <strong>Alamat:</strong> {address}</p>
              <p>📞 <strong>Telepon:</strong> {phone}</p>
              <p>⏰ <strong>Jam Buka:</strong> Senin - Minggu (08:00 - 22:00 WIB)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}