import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-amber-50 text-stone-800">
      {/* Header / Navbar */}
      <header className="flex justify-between items-center p-6 bg-amber-900 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">Kopi Artuphay</h1>
        <nav className="space-x-4">
          <Link href="/menu" className="hover:underline">Menu</Link>
          <Link href="/about" className="hover:underline">Tentang Kami</Link>
          <Link 
            href="/order?table=1" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Pesan di Meja
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h2 className="text-4xl font-extrabold text-amber-900 mb-4">
          Nikmati Suasana & Cita Rasa Terbaik
        </h2>
        <p className="text-lg text-stone-600 max-w-xl mx-auto mb-8">
          Pesan makanan dan minuman favorit Anda langsung dari meja tanpa perlu mengantre di kasir.
        </p>
        <Link 
          href="/order?table=1" 
          className="bg-amber-800 hover:bg-amber-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg text-lg"
        >
          Lihat Menu & Pesan Sekarang
        </Link>
      </section>
    </main>
  );
}