"use client"; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/Context/AuthContext'; // <-- 1. Import useAuth

// Sesuaikan URL Backend
const API_BASE_URL = 'http://localhost:5000/api/akun'; 

// ==========================================================
// KOMPONEN FORM LOGIN (DIMODIFIKASI)
// ==========================================================
interface LoginFormProps {
  role: 'admin' | 'kasir'; // <-- 2. Butuh 'role' sebagai prop
  onBack: () => void; // <-- 3. Butuh fungsi 'onBack'
}

const LoginForm = ({ role, onBack }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth(); // <-- 4. Ambil fungsi 'login' dari context

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json(); 

      if (!res.ok) {
        throw new Error(data.message || 'Gagal login');
      }

      // --- PERUBAHAN BESAR DI SINI ---
      
      // 5. Cek apakah role dari backend SESUAI dengan yang dipilih
      if (data.role !== role) {
        setError(`Login Gagal. Akun ini terdaftar sebagai '${data.role}', bukan '${role}'.`);
        return;
      }

      // 6. Simpan SEMUA data ke localStorage
      localStorage.setItem('loggedInUser', data.email); 
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.role); // <-- SIMPAN ROLE
      
      // 7. Panggil context login
      login({ email: data.email, role: data.role });

      // 8. Arahkan ke dashboard
      router.push('/dashboard');
      // --- AKHIR PERUBAHAN ---
      
    } catch (error: any) {
      setError(error.message); 
    }
  };

  return (
    <>
      {/* 9. Judul dinamis & tombol kembali */}
      <div className="d-flex align-items-center mb-4">
        <button 
          className="btn btn-outline-secondary me-3" 
          onClick={onBack}
          aria-label="Kembali"
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="text-center fw-bold mb-0">
          Login {role === 'admin' ? 'Admin' : 'Kasir'}
        </h2>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form id="login-form" onSubmit={handleLogin}>
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary btn-lg fw-bold">Masuk</button>
        </div>
      </form>
      {/* 10. Link register DIHAPUS (Req 3) */}
    </>
  );
};


// ==========================================================
// KOMPONEN BARU: PEMILIH PERAN
// ==========================================================
interface RoleSelectorProps {
  onSelectRole: (role: 'admin' | 'kasir') => void;
}

const RoleSelector = ({ onSelectRole }: RoleSelectorProps) => {
  return (
    <div className="text-center">
      <h2 className="text-center fw-bold mb-4">Login Sebagai</h2>
      <div className="d-grid gap-3">
        <button 
          className="btn btn-primary btn-lg fw-bold p-3"
          onClick={() => onSelectRole('admin')}
        >
          <i className="bi bi-person-gear me-2"></i>
          Admin
        </button>
        <button 
          className="btn btn-outline-primary btn-lg fw-bold p-3"
          onClick={() => onSelectRole('kasir')}
        >
          <i className="bi bi-person-video me-2"></i>
          Kasir
        </button>
      </div>
    </div>
  );
};


// ==========================================================
// KOMPONEN UTAMA HALAMAN (DIMODIFIKASI)
// ==========================================================
export default function AuthPage() {
  // 11. State baru untuk mengontrol tampilan
  const [view, setView] = useState<'select' | 'loginAdmin' | 'loginKasir'>('select');

  const renderView = () => {
    switch(view) {
      case 'loginAdmin':
        return <LoginForm role="admin" onBack={() => setView('select')} />;
      case 'loginKasir':
        return <LoginForm role="kasir" onBack={() => setView('select')} />;
      case 'select':
      default:
        return <RoleSelector onSelectRole={(role) => setView(role === 'admin' ? 'loginAdmin' : 'loginKasir')} />;
    }
  };

  return (
    <div className="login-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                {/* 12. Render tampilan berdasarkan state 'view' */}
                {renderView()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}