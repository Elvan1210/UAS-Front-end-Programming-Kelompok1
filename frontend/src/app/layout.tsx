// frontend/src/app/layout.tsx

"use client";

import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react"; // Tambah useState

// Import AuthProvider dan useAuth
import { AuthProvider, useAuth } from "@/Context/AuthContext";

// === IMPORT NETWORK STATUS HANDLER ===
import { NetworkStatusHandler } from "@/components/NetworkStatusHandler";

// === 1. UPDATE KOMPONEN SIDEBAR (Terima props isOpen & onClose) ===
const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth(); 

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout(); 
  };

  return (
    // Tambahkan class 'active' jika isOpen bernilai true (untuk HP)
    <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div>
        <div className="d-flex justify-content-between align-items-center">
            <a className="navbar-brand" href="/dashboard">
            <i className="bi bi-shop"></i> Kantin Kasir
            </a>
            {/* Tombol X (Close) hanya muncul di HP */}
            <button className="btn text-white d-lg-none" onClick={onClose}>
                <i className="bi bi-x-lg"></i>
            </button>
        </div>

        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            {/* Tambahkan onClick={onClose} agar sidebar nutup pas link diklik */}
            <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`} onClick={onClose}>
              <i className="bi bi-grid-fill"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/kasir" className={`nav-link ${pathname === '/kasir' ? 'active' : ''}`} onClick={onClose}>
              <i className="bi bi-cart-fill"></i> Halaman Kasir
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/menu/kelola" className={`nav-link ${pathname.startsWith('/menu') ? 'active' : ''}`} onClick={onClose}>
              <i className="bi bi-box-seam-fill"></i> Manajemen Menu
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/transaksi" className={`nav-link ${pathname === '/transaksi' ? 'active' : ''}`} onClick={onClose}>
              <i className="bi bi-clock-history"></i> Histori Transaksi
            </Link>
          </li>
          
          {user && user.role === 'admin' && (
            <li className="nav-item">
              <Link 
                href="/admin/register-kasir" 
                className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                onClick={onClose}
              >
                <i className="bi bi-person-plus-fill"></i> Registrasi Kasir
              </Link>
            </li>
          )}
        </ul>
      </div>
      <a className="nav-link logout-link mt-auto mb-3" href="#" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right"></i> Logout
      </a>
    </nav>
  );
};

// (ContentHeader dihapus dari sini karena biasanya dipanggil di page masing-masing, 
// tapi kalau Anda mau menyimpannya tetap tidak masalah, hanya saja tidak digunakan di return bawah)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // State untuk Sidebar Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/login'; 
  const isRootPage = pathname === '/'; 
  const showLayout = !isLoginPage && !isRootPage;

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#4A90E2" />
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body>
        <AuthProvider>
          <NetworkStatusHandler />

          {showLayout ? (
            <>
              {/* === 2. PASANG SIDEBAR DENGAN PROPS === */}
              <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
              />

              {/* === 3. OVERLAY GELAP (Muncul di HP saat sidebar aktif) === */}
              <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              ></div>

              <div className="main-content">
                {/* === 4. TOMBOL HAMBURGER (Hanya muncul di HP) === */}
                <div className="d-flex align-items-center mb-3 d-lg-none">
                    <button 
                        className="mobile-toggle-btn" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <i className="bi bi-list"></i>
                    </button>
                    <h5 className="m-0 fw-bold ms-2">Menu</h5>
                </div>

                {children}
              </div>
            </>
          ) : (
            children
          )}
        </AuthProvider>
      </body>
    </html>
  );
}