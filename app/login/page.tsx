'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 text-stone-800">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-stone-200">
        <Link href="/" className="text-xs text-amber-800 underline mb-4 block">← Kembali ke Beranda</Link>
        <h1 className="text-2xl font-bold text-amber-950 mb-2">Login Staf Kafe</h1>
        <p className="text-xs text-stone-500 mb-6">Masuk untuk mengakses Kasir dan Dashboard Admin</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Masukkan username (contoh: admin)"
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-900 hover:bg-amber-950 text-white p-3 rounded-xl font-bold text-sm transition disabled:bg-stone-400 mt-2"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
          <p className="font-bold mb-1">Akun Default Pertama Kali:</p>
          <p>• Username: <strong>admin</strong></p>
          <p>• Password: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
}