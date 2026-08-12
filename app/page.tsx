'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl?: string;
  isBestSeller?: boolean;
}

export default function HomePage() {
  const [storeName, setStoreName] = useState('Kopi Artuphay');
  const [address, setAddress] = useState('Jl. Kebon Sirih No. 12, Jakarta');
  const [phone, setPhone] = useState('081234567890');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.storeName) setStoreName(data.storeName);
        if (data.address) setAddress(data.address);
        if (data.phone) setPhone(data.phone);
      });

    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeaturedProducts(data.slice(0, 3));
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-800 selection:text-white">
      {/* Modern Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-900/90 border-b border-stone-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-amber-900 flex items-center justify-center text-xl shadow-lg shadow-amber-900/20 group-hover:scale-105 transition">
              ☕
            </div>
            <span className="text-xl font-black tracking-tight text-stone-100 group-hover:text-amber-400 transition">
              {storeName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-300">
            <Link href="/menu" className="hover:text-amber-400 transition">
              Menu
            </Link>
            <Link href="/about" className="hover:text-amber-400 transition">
              Tentang Kami
            </Link>
            <Link href="/order/status" className="hover:text-amber-400 transition">
              Cek Pesanan
            </Link>
            <Link href="/login" className="text-stone-400 hover:text-stone-200 transition text-xs font-mono">
              Portal Staf 🔒
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/order?table=1" 
              className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-lg shadow-amber-600/20 hover:scale-105 active:scale-95 transition"
            >
              Pesan di Meja →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 max-w-6xl mx-auto text-center border-b border-stone-800/60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-900/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-800/80 border border-amber-900/50 text-amber-400 text-xs font-bold tracking-wide">
            <span>✨ QR Code Self-Ordering System</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-stone-50 leading-tight max-w-3xl mx-auto">
            Nikmati Cita Rasa Kopi Terbaik & Suasana Hangat
          </h1>

          <p className="text-stone-400 text-base md:text-lg max-w-xl mx-auto">
            Pesan makanan dan minuman favorit Anda langsung dari meja tanpa perlu mengantre di kasir.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link 
              href="/order?table=1" 
              className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-7 py-3.5 rounded-2xl font-black text-base shadow-xl shadow-amber-600/20 hover:scale-105 active:scale-95 transition"
            >
              Lihat Menu & Pesan Sekarang
            </Link>
            <Link 
              href="/about" 
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-7 py-3.5 rounded-2xl font-bold text-base transition"
            >
              Tentang Kami
            </Link>
          </div>

          {/* Badges / Features */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-stone-800/40 p-4 rounded-2xl border border-stone-800">
              <span className="text-2xl block mb-1">⚡</span>
              <h3 className="font-bold text-sm text-stone-200">Pesan dari Meja</h3>
              <p className="text-xs text-stone-400">Scan QR & pesanan langsung ke kasir</p>
            </div>
            <div className="bg-stone-800/40 p-4 rounded-2xl border border-stone-800">
              <span className="text-2xl block mb-1">☕</span>
              <h3 className="font-bold text-sm text-stone-200">Biji Kopi Pilihan</h3>
              <p className="text-xs text-stone-400">100% Arabica lokal sangrai segar</p>
            </div>
            <div className="bg-stone-800/40 p-4 rounded-2xl border border-stone-800">
              <span className="text-2xl block mb-1">📶</span>
              <h3 className="font-bold text-sm text-stone-200">Free WiFi Cepat</h3>
              <p className="text-xs text-stone-400">Nyaman untuk kerja / WFC</p>
            </div>
            <div className="bg-stone-800/40 p-4 rounded-2xl border border-stone-800">
              <span className="text-2xl block mb-1">📱</span>
              <h3 className="font-bold text-sm text-stone-200">Bayar Cash / QRIS</h3>
              <p className="text-xs text-stone-400">Pilihan pembayaran fleksibel</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Preview Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">Rekomendasi Terbaik</span>
            <h2 className="text-2xl md:text-3xl font-black text-stone-100">Menu Pilihan Hari Ini</h2>
          </div>
          <Link href="/menu" className="text-sm font-bold text-amber-400 hover:underline">
            Lihat Semua Menu →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((p) => (
            <div key={p.id} className="bg-stone-800/60 rounded-2xl border border-stone-800 overflow-hidden hover:border-amber-800/50 transition group flex flex-col justify-between">
              <div>
                <img 
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500'} 
                  alt={p.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-stone-100">{p.name}</h3>
                    <span className="bg-amber-900/60 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-700/50">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2">{p.description}</p>
                </div>
              </div>
              <div className="p-5 pt-0 flex justify-between items-center">
                <span className="font-extrabold text-amber-400 text-lg">Rp {p.price.toLocaleString('id-ID')}</span>
                <Link 
                  href="/order?table=1" 
                  className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-3.5 py-1.5 rounded-xl font-bold text-xs transition"
                >
                  Pesan
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 border-t border-stone-800/80 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-lg font-black text-amber-500 block mb-1">{storeName}</span>
            <p className="text-xs text-stone-400">{address}</p>
            <p className="text-xs text-stone-500 mt-1">Hubungi: {phone}</p>
          </div>
          <div className="flex gap-6 text-xs text-stone-400">
            <Link href="/menu" className="hover:text-stone-200">Katalog Menu</Link>
            <Link href="/about" className="hover:text-stone-200">Tentang Kami</Link>
            <Link href="/login" className="hover:text-stone-200">Portal Staf</Link>
          </div>
        </div>
        <p className="text-center text-xs text-stone-600 mt-8">© 2026 {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}