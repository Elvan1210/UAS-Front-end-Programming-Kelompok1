'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
   
  useEffect(() => {
    const email = localStorage.getItem('kasirUserEmail');
    if (email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserEmail(email);
    }
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kasirToken');
    localStorage.removeItem('kasirUserEmail');
    setUserEmail(null);
    router.push('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link href="/" className="navbar-brand">
          Kasir UMKM
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {isClient ? (
              userEmail ? (
                <>
                  <li className="nav-item">
                    <Link href="/menu" className="nav-link">
                      Menu
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {userEmail}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link href="/login" className="nav-link">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/register" className="nav-link">
                      Register
                    </Link>
                  </li>
                </>
              )
            ) : (
              <li className="nav-item">
                <span className="nav-link disabled">Memuat...</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}