import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppNavbar from '@/components/Navbar';
import BootstrapClient from '@/components/BootstrapClient';
import { AuthProvider } from '@/Context/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Kantin Kasir App',
  description: 'Aplikasi kasir untuk UMKM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <AppNavbar />
          <main className="p-4">{children}</main>
          <BootstrapClient />
        </AuthProvider>
      </body>
    </html>
  );
}
