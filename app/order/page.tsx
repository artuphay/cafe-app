'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  isBestSeller?: boolean;
}

interface Promo {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountVal: number;
  minSpend: number;
}

function OrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableNumber = searchParams.get('table') || '1';

  const [menuList, setMenuList] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal Checkout & Promo State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS'>('Cash');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [qrisImageUrl, setQrisImageUrl] = useState('');

useEffect(() => {
  fetch('/api/settings', { cache: 'no-store' })
    .then((res) => res.json())
    .then((data) => {
      if (data.qrisImageUrl) setQrisImageUrl(data.qrisImageUrl);
    });
}, []);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setMenuList(data))
      .catch((err) => console.error(err));
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
        delete notes[id];
      }
      return updated;
    });
  };

  const handleNoteChange = (id: string, note: string) => {
    setNotes((prev) => ({ ...prev, [id]: note }));
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const rawTotalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuList.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const finalTotalPrice = Math.max(0, rawTotalPrice - discountAmount);

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoCodeInput) return;

    try {
      const res = await fetch(`/api/promos?code=${promoCodeInput.trim().toUpperCase()}`);
      if (res.ok) {
        const promo: Promo = await res.json();
        if (rawTotalPrice < promo.minSpend) {
          setPromoError(`Minimal belanja untuk promo ini adalah Rp ${promo.minSpend.toLocaleString('id-ID')}`);
          return;
        }

        let disc = 0;
        if (promo.discountType === 'percentage') {
          disc = Math.round((rawTotalPrice * promo.discountVal) / 100);
        } else {
          disc = promo.discountVal;
        }

        setAppliedPromo(promo);
        setDiscountAmount(disc);
      } else {
        setPromoError('Kode promo tidak ditemukan atau tidak aktif');
      }
    } catch (err) {
      setPromoError('Gagal memvalidasi kode promo');
    }
  };

  const processOrder = async () => {
    if (totalItems === 0) return;
    setIsLoading(true);

    const itemsToSubmit = Object.entries(cart).map(([id, qty]) => {
      const item = menuList.find((m) => m.id === id)!;
      return {
        name: item.name,
        qty: qty,
        price: item.price,
        notes: notes[id] || '',
      };
    });

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: itemsToSubmit,
          totalPrice: finalTotalPrice,
          discountAmount,
          promoCode: appliedPromo ? appliedPromo.code : '',
          paymentMethod,
        }),
      });

      if (res.ok) {
        const createdOrder = await res.json();
        setShowCheckoutModal(false);
        setCart({});
        setNotes({});
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoCodeInput('');
        router.push(`/order/status?id=${createdOrder.id}`);
      } else {
        alert('Gagal mengirim pesanan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMenu = menuList.filter((item) => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans pb-28">
      {/* Sticky Header */}
      <div className="backdrop-blur-md bg-stone-900/90 border-b border-stone-800 p-4 sticky top-0 z-10 flex justify-between items-center shadow-lg">
        <div>
          <Link href="/" className="text-xs underline text-amber-400 block mb-1">← Beranda Kafe</Link>
          <h1 className="text-xl font-black text-stone-100">Pesan - Meja #{tableNumber}</h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-400 block">Total Keranjang</span>
          <span className="font-extrabold text-lg text-amber-400">Rp {finalTotalPrice.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Pencarian & Filter */}
      <div className="p-4 max-w-2xl mx-auto space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Cari makanan atau minuman..."
            className="w-full p-3 bg-stone-800 border border-stone-700 rounded-2xl text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-stone-700 text-stone-300 px-2 py-1 rounded-full font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {['Semua', 'Makanan', 'Minuman', 'Dessert'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shadow ${
                selectedCategory === cat 
                  ? 'bg-amber-600 text-stone-950' 
                  : 'bg-stone-800 text-stone-300 border border-stone-700/60 hover:bg-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Menu Cards */}
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {filteredMenu.length === 0 ? (
          <div className="bg-stone-800/40 p-8 rounded-2xl text-center border border-stone-800 text-stone-400">
            <p className="font-medium text-sm">Menu tidak ditemukan.</p>
          </div>
        ) : (
          filteredMenu.map((item) => {
            const qty = cart[item.id] || 0;
            return (
              <div key={item.id} className="bg-stone-800/60 p-4 rounded-2xl border border-stone-800 space-y-3 shadow-md">
                <div className="flex gap-4 items-start">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300'}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-stone-700/60 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-stone-100 truncate">{item.name}</h3>
                      {item.isBestSeller && (
                        <span className="bg-amber-900/80 text-amber-300 border border-amber-700/60 text-[10px] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                          🔥 Best Seller
                        </span>
                      )}
                      {!item.isAvailable && (
                        <span className="bg-red-900/60 text-red-300 border border-red-800 text-xs px-2 py-0.5 rounded font-bold">Habis</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mb-2 line-clamp-2">{item.description}</p>
                    <span className="font-bold text-amber-400 text-sm">Rp {item.price.toLocaleString('id-ID')}</span>
                  </div>

                  <div>
                    {!item.isAvailable ? (
                      <button disabled className="bg-stone-800 text-stone-500 px-3 py-1.5 rounded-xl text-xs font-bold cursor-not-allowed">
                        Habis
                      </button>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => addToCart(item.id)}
                        className="bg-amber-600 text-stone-950 px-3.5 py-1.5 rounded-xl text-xs font-black hover:bg-amber-500 transition shadow"
                      >
                        + Tambah
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-stone-900 p-1 rounded-xl border border-amber-900/50">
                        <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-amber-600 text-stone-950 rounded-lg font-bold text-xs">-</button>
                        <span className="font-bold text-amber-400 text-xs">{qty}</span>
                        <button onClick={() => addToCart(item.id)} className="w-6 h-6 bg-amber-600 text-stone-950 rounded-lg font-bold text-xs">+</button>
                      </div>
                    )}
                  </div>
                </div>

                {qty > 0 && (
                  <div className="pt-2 border-t border-stone-700/60">
                    <input
                      type="text"
                      value={notes[item.id] || ''}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      placeholder="📝 Catatan khusus (contoh: Less sugar / Tanpa pedas)"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-700 bg-stone-900/80 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-amber-600 text-stone-950 p-4 rounded-2xl shadow-2xl flex justify-between items-center z-20 font-black">
          <div>
            <p className="text-xs text-stone-900 font-bold">{totalItems} Item Dipilih</p>
            <p className="font-black text-lg">Rp {finalTotalPrice.toLocaleString('id-ID')}</p>
          </div>
          <button 
            onClick={() => setShowCheckoutModal(true)}
            className="bg-stone-950 hover:bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold transition text-xs shadow-lg"
          >
            Lanjut Pembayaran →
          </button>
        </div>
      )}

      {/* Modal Checkout */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-800 text-stone-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-amber-400 border-b border-stone-800 pb-2">Konfirmasi & Pembayaran</h2>
            <p className="text-xs text-stone-400">Pilih metode pembayaran untuk Meja #{tableNumber}</p>

            <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/60 space-y-2">
              <label className="block text-xs font-bold text-stone-300">🎟️ Punya Kode Promo / Kupon?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="SENJA10"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-stone-700 bg-stone-900 font-bold text-amber-400 uppercase focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-3 py-2 rounded-xl text-xs font-bold transition"
                >
                  Pasang
                </button>
              </div>
              {promoError && <p className="text-xs text-red-400 font-semibold">{promoError}</p>}
              {appliedPromo && (
                <div className="bg-emerald-900/40 border border-emerald-700/60 text-emerald-300 p-2 rounded-lg text-xs font-bold flex justify-between items-center">
                  <span>Kupon "{appliedPromo.code}" Terpasang</span>
                  <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('Cash')}
                className={`w-full p-3 rounded-xl border font-bold text-sm text-left flex justify-between items-center ${
                  paymentMethod === 'Cash' ? 'border-amber-500 bg-amber-950/40 text-amber-300' : 'border-stone-800 text-stone-400 bg-stone-800/40'
                }`}
              >
                <span>💵 Bayar di Kasir (Cash)</span>
                {paymentMethod === 'Cash' && <span>✓</span>}
              </button>

              <button
                onClick={() => setPaymentMethod('QRIS')}
                className={`w-full p-3 rounded-xl border font-bold text-sm text-left flex justify-between items-center ${
                  paymentMethod === 'QRIS' ? 'border-amber-500 bg-amber-950/40 text-amber-300' : 'border-stone-800 text-stone-400 bg-stone-800/40'
                }`}
              >
                <span>📱 Scan QRIS Digital</span>
                {paymentMethod === 'QRIS' && <span>✓</span>}
              </button>
            </div>

           {paymentMethod === 'QRIS' && (
  <div className="p-4 bg-stone-800/40 rounded-xl border border-stone-800 text-center space-y-2">
    <p className="text-xs font-bold text-stone-300">Scan QRIS Kafe untuk Pembayaran</p>
    {qrisImageUrl ? (
      <img src={qrisImageUrl} alt="Poster QRIS Resmi" className="w-56 mx-auto rounded-xl shadow-lg border border-amber-800" />
    ) : (
      <div className="w-44 h-44 mx-auto bg-amber-950 text-amber-400 rounded-xl flex items-center justify-center font-bold text-xs p-2 border border-amber-800">
        [ KODE QRIS KAFE ]
      </div>
    )}
    <p className="text-xs text-amber-400 font-bold pt-1">Total: Rp {finalTotalPrice.toLocaleString('id-ID')}</p>
  </div>
)}
            <div className="pt-2 border-t border-stone-800 text-sm space-y-1">
              <div className="flex justify-between text-xs text-stone-400">
                <span>Subtotal:</span>
                <span>Rp {rawTotalPrice.toLocaleString('id-ID')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-bold">
                  <span>Diskon Kupon:</span>
                  <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base text-amber-400 pt-1 border-t border-stone-800">
                <span>Total Akhir:</span>
                <span>Rp {finalTotalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="w-1/2 bg-stone-800 hover:bg-stone-700 text-stone-300 p-2.5 rounded-xl text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={processOrder}
                disabled={isLoading}
                className="w-1/2 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-stone-950 p-2.5 rounded-xl text-xs font-extrabold transition shadow"
              >
                {isLoading ? 'Mengirim...' : 'Kirim Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Memuat Menu...</div>}>
      <OrderContent />
    </Suspense>
  );
}