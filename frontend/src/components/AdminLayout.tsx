"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Fungsi untuk toggle (buka/tutup) sidebar
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fungsi menutup sidebar saat menu diklik (penting buat UX di HP)
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      {/* --- SIDEBAR --- */}
      {/* Tambahkan class 'active' jika state isSidebarOpen = true */}
      <nav className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
        <div className="d-flex align-items-center justify-content-between px-3 mb-4">
           {/* Brand Name */}
           <a className="navbar-brand" href="#">Kantin Kasir</a>
           {/* Tombol close (X) khusus di dalam sidebar untuk HP (opsional) */}
           <button className="btn text-white d-lg-none" onClick={closeSidebar}>
             <i className="bi bi-x-lg"></i>
           </button>
        </div>
        
        <div className="nav flex-column px-2">
          <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="bi bi-grid-fill"></i> Dashboard
          </Link>
          <Link href="/kasir" className={`nav-link ${pathname === '/kasir' ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="bi bi-cart-fill"></i> Halaman Kasir
          </Link>
          <Link href="/menu/kelola" className={`nav-link ${pathname.includes('/menu') ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="bi bi-box-seam-fill"></i> Manajemen Menu
          </Link>
          <Link href="/transaksi" className={`nav-link ${pathname === '/transaksi' ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="bi bi-clock-history"></i> Histori Transaksi
          </Link>
          <Link href="/admin/register-kasir" className={`nav-link ${pathname === '/admin/register-kasir' ? 'active' : ''}`} onClick={closeSidebar}>
            <i className="bi bi-person-plus-fill"></i> Registrasi Kasir
          </Link>
          <div className="mt-4 border-top border-secondary pt-3">
             <a href="#" className="nav-link text-danger" onClick={() => {
                localStorage.removeItem("loggedInUser");
                window.location.href = '/login';
             }}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </a>
          </div>
        </div>
      </nav>

      {/* --- OVERLAY (Background gelap saat sidebar muncul di HP) --- */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`} 
        onClick={closeSidebar} // Klik di luar sidebar untuk menutup
      ></div>

      {/* --- MAIN CONTENT --- */}
      <main className="main-content">
        
        {/* Header Bar untuk Tombol Burger */}
        <div className="d-flex align-items-center mb-3 d-lg-none">
          <button className="mobile-toggle-btn" onClick={toggleSidebar}>
            <i className="bi bi-list"></i> {/* Ikon Garis 3 */}
          </button>
          <h4 className="m-0 fw-bold">Menu</h4>
        </div>

        {children}
      </main>
    </>
  );
}