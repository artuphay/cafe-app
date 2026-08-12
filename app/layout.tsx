import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kopi Artuphay - Cafe Management & QR Order System",
  description: "Sistem pemesanan kafe modern berbasis QR Code meja, layar POS kasir real-time, dan laporan penjualan otomatis.",
  openGraph: {
    title: "Kopi Artuphay - Cafe Management & QR Order System",
    description: "Sistem pemesanan kafe modern berbasis QR Code meja, layar POS kasir real-time, dan laporan penjualan otomatis.",
    url: "https://cafe-app-dusky-omega.vercel.app",
    siteName: "Kopi Artuphay Cafe",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

