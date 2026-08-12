'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TableItem {
  id: string;
  tableNumber: string;
}

export default function ManageTablesPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [storeName, setStoreName] = useState('Kopi Artuphay');
  const [newTableNumber, setNewTableNumber] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.storeName) setStoreName(data.storeName);
      });
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber) return;

    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: newTableNumber }),
      });

      if (res.ok) {
        setNewTableNumber('');
        fetchTables();
      } else {
        alert('Nomor meja sudah ada atau gagal dibuat.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  };

  const deleteTable = async (id: string) => {
    if (!confirm('Yakin ingin menghapus meja ini?')) return;
    await fetch(`/api/tables?id=${id}`, { method: 'DELETE' });
    fetchTables();
  };

  const printTableQr = (tableNum: string) => {
    const printWindow = window.open('', '_blank', 'width=500,height=600');
    if (!printWindow) return;

    const host = window.location.origin;
    const orderUrl = `${host}/order?table=${tableNum}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(orderUrl)}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Kartu QR Meja #${tableNum} - ${storeName}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            .card { border: 3px solid #78350f; border-radius: 24px; padding: 30px; max-width: 320px; margin: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .title { font-size: 22px; font-weight: bold; color: #78350f; margin-bottom: 5px; }
            .table-num { font-size: 32px; font-weight: 900; color: #451a03; margin: 15px 0; }
            .qr-img { width: 220px; height: 220px; margin: 10px auto; border-radius: 12px; border: 2px solid #f59e0b; padding: 8px; }
            .sub { font-size: 13px; color: #57534e; margin-top: 15px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">${storeName.toUpperCase()}</div>
            <div class="table-num">MEJA #${tableNum}</div>
            <img class="qr-img" src="${qrApiUrl}" alt="QR Code" />
            <div class="sub">📱 Scan QR Code Ini Untuk Memesan Menu</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-6">
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
              <span className="text-amber-300/80 text-xs font-semibold">QR Code Meja</span>
            </div>

            <h1 className="text-2xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>Generator & Cetak QR Code Meja</span>
            </h1>
            <p className="text-sm text-amber-200 mt-1">Kelola nomor meja dan cetak kartu QR Code pemesanan</p>
          </div>
        </div>

        {/* Form Tambah Meja */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2">➕ Tambah Nomor Meja</h2>
          <form onSubmit={handleAddTable} className="flex gap-3 max-w-md">
            <input
              type="text"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              required
              placeholder="Contoh: 01 atau 12"
              className="flex-1 p-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
            />
            <button
              type="submit"
              className="bg-amber-900 hover:bg-amber-950 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow"
            >
              Tambah Meja
            </button>
          </form>
        </div>

        {/* Grid Meja & QR Code */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2">📌 Daftar Meja & Kartu QR Code</h2>
          {loading ? (
            <p className="text-sm text-stone-500">Memuat daftar meja...</p>
          ) : tables.length === 0 ? (
            <p className="text-sm text-stone-400">Belum ada nomor meja yang ditambahkan.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tables.map((tbl) => {
                const host = typeof window !== 'undefined' ? window.location.origin : '';
                const orderUrl = `${host}/order?table=${tbl.tableNumber}`;
                const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(orderUrl)}`;

                return (
                  <div key={tbl.id} className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-center flex flex-col justify-between space-y-3 hover:shadow-md transition">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">{storeName}</span>
                      <h3 className="text-2xl font-black text-amber-950 my-1">MEJA #{tbl.tableNumber}</h3>
                      <img
                        src={qrImgUrl}
                        alt={`QR Meja ${tbl.tableNumber}`}
                        className="w-32 h-32 mx-auto rounded-lg border border-amber-300 p-1 bg-white my-2"
                      />
                      <p className="text-xs text-stone-500 font-mono truncate">{orderUrl}</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-stone-200">
                      <button
                        onClick={() => printTableQr(tbl.tableNumber)}
                        className="w-full bg-amber-900 hover:bg-amber-950 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow"
                      >
                        <span>🖨️</span>
                        <span>Cetak QR</span>
                      </button>
                      <button
                        onClick={() => deleteTable(tbl.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-bold transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}