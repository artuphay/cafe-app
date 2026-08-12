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
  isAvailable: boolean;
}

export default function MenuCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const filtered = products.filter((p) => {
    const catMatch = selectedCategory === 'Semua' || p.category === selectedCategory;
    const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-900/90 border-b border-stone-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-black text-stone-100">Kopi Artuphay</Link>
          <nav className="flex items-center gap-6 text-sm font-semibold text-stone-300">
            <Link href="/menu" className="text-amber-400">Menu</Link>
            <Link href="/about" className="hover:text-amber-400">Tentang Kami</Link>
            <Link href="/order?table=1" className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-4 py-2 rounded-xl text-xs font-extrabold">
              Pesan di Meja
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-stone-50">Katalog Menu Kafe</h1>
          <p className="text-xs text-stone-400">Daftar lengkap sajian kopi, makanan, dan penutup favorit Anda</p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-800/40 p-4 rounded-2xl border border-stone-800">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Cari menu..."
            className="w-full sm:w-64 p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
            {['Semua', 'Makanan', 'Minuman', 'Dessert'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-amber-600 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="bg-stone-800/60 rounded-2xl border border-stone-800 overflow-hidden flex flex-col justify-between">
              <div>
                <img 
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400'} 
                  alt={p.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base text-stone-100">{p.name}</h3>
                    <span className="text-xs font-semibold text-amber-400">Rp {p.price.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2">{p.description}</p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <Link
                  href="/order?table=1"
                  className="w-full block text-center bg-amber-600 hover:bg-amber-500 text-stone-950 py-2 rounded-xl font-bold text-xs transition shadow"
                >
                  Pesan Sekarang →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}