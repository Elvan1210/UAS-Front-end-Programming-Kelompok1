"use client";

import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser"); 
    window.location.href = '/login';
  };

  return (
    <nav className="sidebar">
      <div>
        <a className="navbar-brand" href="/dashboard">
          <i className="bi bi-shop"></i> Kantin Kasir
        </a>
        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>
              <i className="bi bi-grid-fill"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/kasir" className={`nav-link ${pathname === '/kasir' ? 'active' : ''}`}>
              <i className="bi bi-cart-fill"></i> Halaman Kasir
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/menu" className={`nav-link ${pathname.startsWith('/menu') ? 'active' : ''}`}>
              <i className="bi bi-box-seam-fill"></i> Manajemen Menu
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/transaksi" className={`nav-link ${pathname === '/transaksi' ? 'active' : ''}`}>
              <i className="bi bi-clock-history"></i> Histori Transaksi
            </Link>
          </li>
        </ul>
      </div>
      <a className="nav-link logout-link mt-auto mb-3" href="#" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right"></i> Logout
      </a>
    </nav>
  );
};

const ContentHeader = ({ title }: { title: string }) => {
  const [userEmail, setUserEmail] = useState("Loading...");

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      setUserEmail(user);
    } else {
      setUserEmail("Tamu");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = '/login';
  };

  return (
    <header className="content-header">
      <h1>{title}</h1>
      <div className="header-actions">
        <div className="user-profile dropdown">
          <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="https://via.placeholder.com/40" alt="User" />
            <span id="user-display-email">{userEmail}</span>
          </a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><a className="dropdown-item logout-link" href="#" onClick={handleLogout}>Logout</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const isLoginPage = pathname === '/login'; 

  const isRootPage = pathname === '/'; 

  const showLayout = !isLoginPage && !isRootPage;

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <html lang="id">
      <body>
        {showLayout ? (
          <>
            <Sidebar />
            <div className="main-content">
              {children}
            </div>
          </>
        ) : (
          children
        )}
      </body>
    </html>
  );
}