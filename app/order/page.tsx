'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  isAvailable: boolean;
}

function OrderContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';

  const [menuList, setMenuList] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);

  // Mengambil data menu dinamis dari Database API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setMenuList(data);
        }
      } catch (err) {
        console.error('Gagal mengambil menu:', err);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id] -= 1;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuList.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleCheckout = async () => {
    if (totalItems === 0) return;
    setIsLoading(true);

    const itemsToSubmit = Object.entries(cart).map(([id, qty]) => {
      const item = menuList.find((m) => m.id === id)!;
      return {
        name: item.name,
        qty: qty,
        price: item.price,
      };
    });

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: itemsToSubmit,
          totalPrice,
        }),
      });

      if (res.ok) {
        alert(`Pesanan untuk Meja #${tableNumber} berhasil dikirim ke Kasir!`);
        setCart({});
      } else {
        alert('Gagal mengirim pesanan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMenu = selectedCategory === 'Semua' 
    ? menuList 
    : menuList.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 pb-24">
      <div className="bg-amber-900 text-white p-4 sticky top-0 z-10 flex justify-between items-center shadow-md">
        <div>
          <Link href="/" className="text-xs underline text-amber-200 block mb-1">← Beranda</Link>
          <h1 className="text-xl font-bold">Pesan - Meja #{tableNumber}</h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-amber-200 block">Total Keranjang</span>
          <span className="font-bold text-lg">Rp {totalPrice.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="flex gap-2 p-4 overflow-x-auto bg-white border-b">
        {['Semua', 'Makanan', 'Minuman', 'Dessert'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-amber-900 text-white' 
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {filteredMenu.map((item) => {
          const qty = cart[item.id] || 0;
          return (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-stone-200">
              <div className="pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-amber-950">{item.name}</h3>
                  {!item.isAvailable && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold">Habis</span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mb-2">{item.description}</p>
                <span className="font-semibold text-amber-800">Rp {item.price.toLocaleString('id-ID')}</span>
              </div>
              <div>
                {!item.isAvailable ? (
                  <button disabled className="bg-stone-200 text-stone-400 px-3 py-1.5 rounded-lg text-xs font-bold cursor-not-allowed">
                    Habis
                  </button>
                ) : qty === 0 ? (
                  <button
                    onClick={() => addToCart(item.id)}
                    className="bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-900 transition whitespace-nowrap"
                  >
                    + Tambah
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-amber-100 p-1.5 rounded-lg border border-amber-300">
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 bg-amber-800 text-white rounded font-bold">-</button>
                    <span className="font-bold text-amber-900">{qty}</span>
                    <button onClick={() => addToCart(item.id)} className="w-7 h-7 bg-amber-800 text-white rounded font-bold">+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-amber-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center z-20">
          <div>
            <p className="text-xs text-amber-200">{totalItems} Item Dipilih</p>
            <p className="font-bold text-lg">Rp {totalPrice.toLocaleString('id-ID')}</p>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={isLoading}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-400 text-amber-950 px-5 py-2.5 rounded-xl font-bold transition"
          >
            {isLoading ? 'Mengirim...' : 'Pesan Sekarang →'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat Menu...</div>}>
      <OrderContent />
    </Suspense>
  );
}