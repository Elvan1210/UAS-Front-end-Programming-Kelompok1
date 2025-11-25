"use client";

// impor css dan komponen
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react"; 
import { AuthProvider, useAuth } from "@/Context/AuthContext";
import { NetworkStatusHandler } from "@/components/NetworkStatusHandler";

// komponen sidebar navigasi
const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth(); 

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout(); 
  };

  // logika menentukan kelas aktif
  const getActiveClass = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return 'active-dashboard';
    if (path === '/kasir' && pathname === '/kasir') return 'active-kasir';
    if (path === '/menu' && pathname.startsWith('/menu')) return 'active-menu';
    if (path === '/transaksi' && pathname === '/transaksi') return 'active-transaksi';
    if (path === '/admin' && pathname.startsWith('/admin')) return 'active-admin';
    return '';
  };

  return (
    <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className="d-flex flex-column h-100">
        
        {/* bagian logo aplikasi */}
        <div className="px-3 mt-3 mb-5">
            <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center shadow-sm text-white" 
                     style={{
                        width: '48px', 
                        height: '48px', 
                        background: 'linear-gradient(135deg, #131313 0%, #333 100%)', 
                        borderRadius: '12px',
                        fontSize: '1.5rem'
                     }}>
                  <i className="bi bi-shop"></i>
                </div>
                
                <div style={{lineHeight: '1.2'}}>
                    <div style={{fontSize: '0.85rem', fontWeight: '500', color: '#888'}}>Aplikasi</div>
                    <div style={{fontSize: '1.1rem', fontWeight: '800', color: '#131313', letterSpacing: '-0.5px'}}>
                        Kasir Kantin <br/> 
                        <span style={{color: '#131313'}}>Rajawali</span>
                    </div>
                </div>
            </div>
            
            <button className="btn text-dark d-lg-none position-absolute top-0 end-0 mt-3 me-3" onClick={onClose}>
                <i className="bi bi-x-lg fs-4"></i>
            </button>
        </div>

        <ul className="nav flex-column gap-2 flex-grow-1">
          <li className="nav-item">
            <Link href="/dashboard" className={`nav-link ${getActiveClass('/dashboard')}`} onClick={onClose}>
               <i className="bi bi-grid-fill"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/kasir" className={`nav-link ${getActiveClass('/kasir')}`} onClick={onClose}>
              <i className="bi bi-cart-fill"></i> Halaman Kasir
            </Link>
          </li>
           <li className="nav-item">
            <Link href="/menu" className={`nav-link ${getActiveClass('/menu')}`} onClick={onClose}>
              <i className="bi bi-box-seam-fill"></i> Manajemen Menu
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/transaksi" className={`nav-link ${getActiveClass('/transaksi')}`} onClick={onClose}>
               <i className="bi bi-clock-history"></i> Histori Transaksi
            </Link>
          </li>
          
          {/* menu khusus admin */}
          {user && user.role === 'admin' && (
            <>
                <div className="my-2 px-3">
                    <hr style={{borderColor: '#eee', margin: '1rem 0 0.5rem 0'}}/>
                    <small className="text-muted fw-bold" style={{fontSize: '0.7rem', letterSpacing: '1px'}}>ADMINISTRATOR</small>
                </div>
                <li className="nav-item">
                 <Link href="/admin/register-kasir" className={`nav-link ${getActiveClass('/admin')}`} onClick={onClose}>
                    <i className="bi bi-person-plus-fill"></i> Registrasi Kasir
                </Link>
                </li>
            </>
          )}
        </ul>

        <a className="nav-link text-danger mb-4 fw-bold px-3" href="#" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Logout
        </a>
      </div>
    </nav>
  );
};

// layout utama aplikasi
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body>
        <AuthProvider>
          <NetworkStatusHandler />

          {showLayout ? (
            <>
               <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
              <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

              <div className="main-content">
                <div className="d-flex align-items-center mb-3 d-lg-none">
                    <button className="mobile-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <i className="bi bi-list"></i>
                    </button>
                    <h5 className="m-0 fw-bold ms-2 text-dark">Kantin Rajawali</h5>
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