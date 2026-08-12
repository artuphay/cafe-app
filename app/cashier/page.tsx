'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  totalPrice: number;
  discountAmount?: number;
  promoCode?: string;
  paymentMethod: string;
  status: 'Pending' | 'Memasak' | 'Selesai';
  createdAt: string;
}

export default function CashierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('Semua');
  const [storeName, setStoreName] = useState('Kopi Artuphay');
  const [footerText, setFooterText] = useState('Terima kasih atas kunjungan Anda!');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  // Tambahkan pemeriksaan login di useEffect paling atas
  useEffect(() => {
    const verifyLogin = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          window.location.href = '/login';
        }
      } catch (err) {
        window.location.href = '/login';
      }
    };

    verifyLogin();
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.storeName) setStoreName(data.storeName);
        if (data.footerText) setFooterText(data.footerText);
      });
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, newStatus: 'Pending' | 'Memasak' | 'Selesai') => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      alert('Gagal memperbarui status');
    }
  };

  // Fungsi Cetak Struk dengan Rincian Diskon Promo
  const printReceipt = (ord: Order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const subtotal = ord.items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const hasDiscount = ord.discountAmount && ord.discountAmount > 0;

    const itemsHtml = ord.items
      .map(
        (it) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>${it.qty}x ${it.name} ${it.notes ? `(${it.notes})` : ''}</span>
          <span>Rp ${(it.price * it.qty).toLocaleString('id-ID')}</span>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pembayaran - Meja #${ord.tableNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; width: 300px; margin: auto; }
            .center { text-align: center; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            .total { font-weight: bold; font-size: 15px; }
            .disc { color: #000; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin:0;">${storeName.toUpperCase()}</h2>
            <p style="margin:4px 0; font-size:12px;">Struk Pembayaran Pembeli</p>
          </div>
          <div class="line"></div>
          <p style="margin:2px 0;">No. Meja: #${ord.tableNumber}</p>
          <p style="margin:2px 0;">ID: ${ord.id.slice(0, 8)}</p>
          <p style="margin:2px 0;">Waktu: ${new Date(ord.createdAt).toLocaleString('id-ID')}</p>
          <p style="margin:2px 0;">Bayar: ${ord.paymentMethod}</p>
          <div class="line"></div>
          ${itemsHtml}
          <div class="line"></div>
          <div style="display:flex; justify-content:space-between;">
            <span>Subtotal:</span>
            <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
          </div>
          ${
            hasDiscount
              ? `<div style="display:flex; justify-content:space-between;" class="disc">
                  <span>Diskon (${ord.promoCode || 'PROMO'}):</span>
                  <span>-Rp ${ord.discountAmount?.toLocaleString('id-ID')}</span>
                </div>`
              : ''
          }
          <div class="line"></div>
          <div style="display:flex; justify-content:space-between;" class="total">
            <span>TOTAL BAYAR:</span>
            <span>Rp ${ord.totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <div class="line"></div>
          <p class="center" style="font-size:11px; margin-top:15px;">${footerText}</p>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredOrders = filter === 'Semua' ? orders : orders.filter((ord) => ord.status === filter);
  const totalIncome = orders.filter((ord) => ord.status === 'Selesai').reduce((sum, ord) => sum + ord.totalPrice, 0);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-amber-950 text-white p-6 rounded-2xl shadow-lg">
          <div>
            <Link href="/" className="text-xs text-amber-200 underline mb-1 block">← Kembali ke Beranda</Link>
            <h1 className="text-2xl font-bold">Layar Kasir & POS</h1>
            <p className="text-sm text-amber-200">Kelola pesanan masuk dan cetak struk pembayaran</p>
          </div>
          <div className="mt-4 md:mt-0 bg-amber-900 px-4 py-2.5 rounded-xl text-right">
            <span className="text-xs text-amber-200 block">Total Pendapatan Selesai</span>
            <span className="text-xl font-extrabold text-white">Rp {totalIncome.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="flex gap-2 bg-white p-3 rounded-xl border border-stone-200 shadow-sm overflow-x-auto">
          {['Semua', 'Pending', 'Memasak', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                filter === st ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st} ({st === 'Semua' ? orders.length : orders.filter((o) => o.status === st).length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((ord) => {
            const subtotal = ord.items.reduce((sum, it) => sum + it.price * it.qty, 0);
            const hasDiscount = ord.discountAmount && ord.discountAmount > 0;

            return (
              <div key={ord.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-stone-100">
                    <div>
                      <span className="text-xs font-bold text-stone-400 block">
                        {new Date(ord.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {ord.paymentMethod}
                      </span>
                      <h2 className="text-xl font-extrabold text-amber-950">Meja #{ord.tableNumber}</h2>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'Pending'
                          ? 'bg-red-100 text-red-700'
                          : ord.status === 'Memasak'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {ord.items.map((it) => (
                      <div key={it.id} className="text-sm">
                        <div className="flex justify-between">
                          <span><strong className="text-amber-900">{it.qty}x</strong> {it.name}</span>
                          <span className="text-stone-500">Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
                        </div>
                        {it.notes && <p className="text-xs text-amber-800 italic">Catatan: "{it.notes}"</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="py-3 border-t border-stone-100 mb-4 space-y-1 text-sm">
                    {hasDiscount && (
                      <>
                        <div className="flex justify-between text-xs text-stone-500">
                          <span>Subtotal</span>
                          <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-emerald-700">
                          <span>Diskon Promo ({ord.promoCode})</span>
                          <span>-Rp {ord.discountAmount?.toLocaleString('id-ID')}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-extrabold text-base pt-1">
                      <span>Total Akhir</span>
                      <span className="text-amber-900">Rp {ord.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {ord.status === 'Pending' && (
                      <button
                        onClick={() => updateStatus(ord.id, 'Memasak')}
                        className="w-full bg-amber-800 hover:bg-amber-900 text-white py-2.5 rounded-xl font-bold text-sm transition"
                      >
                        Terima & Masak
                      </button>
                    )}
                    {ord.status === 'Memasak' && (
                      <button
                        onClick={() => updateStatus(ord.id, 'Selesai')}
                        className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-bold text-sm transition"
                      >
                        Tandai Selesai
                      </button>
                    )}
                    {ord.status === 'Selesai' && (
                      <button
                        onClick={() => printReceipt(ord)}
                        className="w-full bg-amber-900 hover:bg-amber-950 text-white py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                      >
                        <span>🖨️</span>
                        <span>Cetak Struk</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}