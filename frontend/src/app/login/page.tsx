"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/Context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/akun`;
const PRIMARY_BLUE = '#1C46F5';

// --- KOMPONEN 1: PILIH PERAN (CARD BOOTSTRAP) ---
const RoleSelection = ({ onSelect }: { onSelect: (role: 'admin' | 'kasir') => void }) => (
  <div className="w-100" style={{ maxWidth: '400px' }}>
    <div className="text-center mb-5">
      <div className="d-inline-flex align-items-center justify-content-center text-white mb-3 rounded-4 shadow-sm" 
           style={{ width: '70px', height: '70px', backgroundColor: PRIMARY_BLUE, fontSize: '2rem' }}>
        <i className="bi bi-shop"></i>
      </div>
      <h2 className="fw-bold text-dark mb-1">Selamat Datang</h2>
      <p className="text-muted">Silakan pilih akses login Anda</p>
    </div>

    <div className="row g-3">
      {/* KASIR CARD */}
      <div className="col-6">
        <div className="card h-100 border-0 shadow-sm p-3 text-center" 
             style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: '#F8F9FA' }}
             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.border = `1px solid ${PRIMARY_BLUE}`; }}
             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.border = 'none'; }}
             onClick={() => onSelect('kasir')}>
          <i className="bi bi-calculator fs-1 mb-2" style={{ color: PRIMARY_BLUE }}></i>
          <h6 className="fw-bold text-dark m-0">Kasir</h6>
        </div>
      </div>

      {/* ADMIN CARD */}
      <div className="col-6">
        <div className="card h-100 border-0 shadow-sm p-3 text-center" 
             style={{ cursor: 'pointer', transition: 'transform 0.2s', backgroundColor: '#F8F9FA' }}
             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.border = `1px solid ${PRIMARY_BLUE}`; }}
             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.border = 'none'; }}
             onClick={() => onSelect('admin')}>
          <i className="bi bi-shield-lock fs-1 mb-2" style={{ color: PRIMARY_BLUE }}></i>
          <h6 className="fw-bold text-dark m-0">Admin</h6>
        </div>
      </div>
    </div>
    
    <p className="text-center text-muted small mt-5">
      Sistem Manajemen Kantin Rajawali
    </p>
  </div>
);

// --- KOMPONEN 2: FORM LOGIN (BOOTSTRAP FORM) ---
const LoginForm = ({ role, onBack }: { role: 'admin' | 'kasir', onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || 'Gagal login');
      
      if (data.role !== role) {
        throw new Error(`Akun ini bukan akun ${role === 'admin' ? 'Admin' : 'Kasir'}.`);
      }

      localStorage.setItem('loggedInUser', data.email);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.role);
      
      login({ email: data.email, role: data.role });
      router.push('/dashboard');

    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="w-100" style={{ maxWidth: '400px' }}>
      <button className="btn btn-link text-decoration-none text-secondary ps-0 mb-4" onClick={onBack}>
        <i className="bi bi-arrow-left me-2"></i> Ganti Peran
      </button>

      <div className="mb-4">
        <h2 className="fw-bold text-dark">Login {role === 'admin' ? 'Admin' : 'Kasir'}</h2>
        <p className="text-muted">
          Masuk untuk mengakses {role === 'admin' ? 'manajemen sistem' : 'halaman transaksi'}.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center small" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label fw-bold small text-secondary">Email</label>
          <div className="input-group">
             <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-envelope"></i></span>
             <input 
                type="email" 
                className="form-control border-start-0 ps-0" 
                placeholder="contoh@kantin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{boxShadow: 'none'}}
             />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold small text-secondary">Password</label>
          <div className="input-group">
             <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-lock"></i></span>
             <input 
                type="password" 
                className="form-control border-start-0 ps-0" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{boxShadow: 'none'}}
             />
          </div>
        </div>

        <button type="submit" className="btn w-100 py-3 text-white fw-bold rounded-3 shadow-sm" 
                style={{backgroundColor: PRIMARY_BLUE, border: 'none'}} 
                disabled={loading}>
          {loading ? (
             <span><span className="spinner-border spinner-border-sm me-2"></span>Memproses...</span>
          ) : (
             'Masuk Sekarang'
          )}
        </button>
      </form>
    </div>
  );
};

// --- MAIN PAGE (LAYOUT BOOTSTRAP) ---
export default function AuthPage() {
  const [view, setView] = useState<'select' | 'admin' | 'kasir'>('select');

  return (
    // Container Fluid Full Height, No Padding
    <div className="container-fluid vh-100 overflow-hidden p-0 bg-white">
      <div className="row g-0 h-100">
        
        {/* PANEL KIRI (BRANDING) - Sembunyi di Mobile (d-none), Muncul di Large Screen (d-lg-flex) */}
        <div className="col-lg-7 d-none d-lg-flex flex-column justify-content-between p-5 position-relative text-white"
             style={{
                background: `linear-gradient(135deg, rgba(28, 70, 245, 0.90) 0%, rgba(28, 70, 245, 0.85) 100%), url('/bg-kantin.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
             }}>
          <div style={{zIndex: 2, maxWidth: '500px'}}>
            <div className="fw-bold mb-4 pb-2 d-inline-block border-bottom border-3 border-warning" style={{borderColor: '#D2FF52 !important', letterSpacing: '1px'}}>
                KANTIN RAJAWALI
            </div>
            <h1 className="display-3 fw-bold mb-3" style={{lineHeight: 1.1}}>
              Solusi Cerdas <br/>
              <span style={{color: '#D2FF52'}}>Manajemen Kantin.</span>
            </h1>
            <p className="fs-5 fw-light opacity-75">
              Sistem terintegrasi untuk operasional kantin yang lebih efisien, 
              cepat, dan transparan di lingkungan Panin Dai-ichi Life Center.
            </p>
          </div>
          <div className="small opacity-50" style={{zIndex: 2}}>
            © 2025 Kantin Rajawali. All Rights Reserved.
          </div>
        </div>

        {/* PANEL KANAN (FORM) - Full Width di Mobile, 5 Kolom di Desktop */}
        <div className="col-12 col-lg-5 d-flex align-items-center justify-content-center bg-white position-relative">
          
          {/* Render View sesuai state */}
          {view === 'select' && <RoleSelection onSelect={(r) => setView(r)} />}
          {view === 'admin' && <LoginForm role="admin" onBack={() => setView('select')} />}
          {view === 'kasir' && <LoginForm role="kasir" onBack={() => setView('select')} />}

        </div>

      </div>
    </div>
  );
}