import type { Metadata, Viewport } from "next";
import "./globals.css";
import SwRegister from "./sw-register";

export const viewport: Viewport = {
  themeColor: "#78350f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Kopi Artuphay - Cafe Management & QR Order System",
  description: "Sistem pemesanan kafe modern berbasis QR Code meja, layar POS kasir real-time, dan laporan penjualan otomatis.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kopi Artuphay",
  },
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
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}