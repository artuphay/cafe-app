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
    <div className="min-h-screen bg-stone-900 font-sans flex items-center justify-center p-4 text-stone-100">
      <div className="bg-stone-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border border-stone-700">
        <Link href="/" className="text-xs text-amber-400 underline mb-4 block">← Kembali ke Beranda Kafe</Link>
        <h1 className="text-2xl font-black text-stone-100 mb-1">Login Staf Kafe</h1>
        <p className="text-xs text-stone-400 mb-6">Masuk untuk mengakses Kasir dan Dashboard Admin</p>

        {error && (
          <div className="bg-red-900/50 text-red-300 p-3 rounded-xl text-xs mb-4 border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin"
              className="w-full p-3 rounded-xl border border-stone-700 bg-stone-900 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-stone-700 bg-stone-900 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 p-3 rounded-xl font-extrabold text-sm transition shadow-lg mt-2 disabled:bg-stone-700"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-amber-950/40 rounded-2xl border border-amber-800/50 text-xs text-amber-300">
          <p className="font-bold mb-1">Akun Default Pertama Kali:</p>
          <p>• Username: <strong>admin</strong></p>
          <p>• Password: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
}