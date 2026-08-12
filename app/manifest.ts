import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kopi Artuphay - Cafe Management System',
    short_name: 'Kopi Artuphay',
    description: 'Sistem Pemesanan QR Meja & POS Kasir Real-time',
    start_url: '/',
    display: 'standalone',
    background_color: '#1c1917',
    theme_color: '#78350f',
    icons: [
      {
        src: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}