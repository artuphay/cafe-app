'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  isAvailable: boolean;
}

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Minuman');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = '/api/products';
    const method = editingId ? 'PATCH' : 'POST';
    const payload = editingId
      ? { id: editingId, name, category, price, description }
      : { name, category, price, description };

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        fetchProducts();
      } else {
        alert('Gagal menyimpan menu.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price.toString());
    setDescription(p.description);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Minuman');
    setPrice('');
    setDescription('');
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    await fetch('/api/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isAvailable: !currentStatus }),
    });
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return;
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-amber-950 text-white p-6 rounded-2xl shadow-lg">
          <div>
            <Link href="/admin" className="text-xs text-amber-200 underline mb-1 block">← Kembali ke Dashboard Admin</Link>
            <h1 className="text-2xl font-bold">Kelola Menu Kafe (CRUD)</h1>
            <p className="text-sm text-amber-200">Tambah, edit, dan atur ketersediaan makanan & minuman</p>
          </div>
        </div>

        {/* Form Tambah/Edit */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2">
            {editingId ? '✏️ Edit Menu' : '➕ Tambah Menu Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Nama Menu</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Contoh: Espresso Aren"
                className="w-full p-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              >
                <option value="Minuman">Minuman</option>
                <option value="Makanan">Makanan</option>
                <option value="Dessert">Dessert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Harga (Rp)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="25000"
                className="w-full p-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Deskripsi Singkat</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Penjelasan bahan/rasa..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>

            <div className="md:col-span-2 flex gap-2 pt-2">
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-950 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah Menu'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2.5 rounded-xl font-bold text-sm transition"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabel Daftar Produk */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-amber-950 mb-4 border-b pb-2">📋 Daftar Menu Aktif</h2>
          {loading ? (
            <p className="text-sm text-stone-500">Memuat data menu...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-100 text-stone-600 border-b">
                    <th className="p-3">Nama Menu</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Status Stok</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-stone-50">
                      <td className="p-3">
                        <span className="font-bold text-amber-950 block">{p.name}</span>
                        <span className="text-xs text-stone-500">{p.description}</span>
                      </td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3 font-bold">Rp {p.price.toLocaleString('id-ID')}</td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleAvailability(p.id, p.isAvailable)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                            p.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {p.isAvailable ? 'Tersedia ✓' : 'Habis ✕'}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEdit(p)}
                            className="bg-amber-100 text-amber-900 hover:bg-amber-200 px-3 py-1 rounded-lg text-xs font-bold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-bold transition"
                          >
                            Hapus
                          </button>
                        </div>
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