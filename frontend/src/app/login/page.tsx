"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/Context/AuthContext';

/* Import file CSS Module yang BARU Anda buat.
  'styles' adalah variabel yang berisi semua class dari file .css
*/
import styles from './login.module.css';

// Sesuaikan URL Backend
const API_BASE_URL = 'http://localhost:5000/api/akun';

// ==========================================================
// KOMPONEN FORM LOGIN (Style Baru)
// ==========================================================
interface LoginFormProps {
  role: 'admin' | 'kasir';
  onBack: () => void;
}

const LoginForm = ({ role, onBack }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State untuk "Site Token" (ada di desain)
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- LOGIKA LOGIN ANDA TETAP SAMA ---
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal login');
      }

      if (data.role !== role) {
        setError(`Login Gagal. Akun ini terdaftar sebagai '${data.role}', bukan '${role}'.`);
        return;
      }

      localStorage.setItem('loggedInUser', data.email);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.role);
      
      login({ email: data.email, role: data.role });

      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.loginForm}>
      <div className={styles.formHeader}>
        <button className={styles.backButton} onClick={onBack} aria-label="Kembali">
          {/* SVG untuk ikon panah kembali */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div>
          <p className={styles.welcomeText}>Welcome to Kantin Kita</p>
          <h2 className={styles.formTitle}>
            Log into your Account
          </h2>
        </div>
      </div>
      
      {/* Tampilkan pesan error jika ada */}
      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      {/* Form dengan style baru. 
        Perhatikan: `className={styles.namaClass}` 
      */}
      <form onSubmit={handleLogin}>
        {/* Desain "evolve" menggunakan "Username", tapi logika Anda "email". Kita tetap pakai "email" untuk logika, tapi labelnya "Username" agar sesuai desain. */}
        <div className={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="email"
            id="username"
            className={styles.inputField}
            placeholder="masukkan email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className={styles.inputField}
            placeholder="masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Input "Site Token" ini ada di desain. 
            Saat ini tidak terhubung ke logika, tapi kita tampilkan
            agar sesuai desain. Anda bisa menambahkannya ke logika nanti.
        */}
        
        <button type="submit" className={styles.submitButton}>Log in</button>
      </form>
    </div>
  );
};


// ==========================================================
// KOMPONEN PEMILIH PERAN (Style Baru)
// ==========================================================
interface RoleSelectorProps {
  onSelectRole: (role: 'admin' | 'kasir') => void;
}

const RoleSelector = ({ onSelectRole }: RoleSelectorProps) => {
  return (
    <div className={styles.roleSelector}>
      <p className={styles.welcomeText}>Welcome to Kantin Kita</p>
      <h2>Log in As</h2>
      <div className={styles.roleButtons}>
        <button
          className={styles.roleButton}
          onClick={() => onSelectRole('admin')}
        >
          {/* Ikon untuk Admin */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
          </svg>
          Admin
        </button>
        <button
          className={styles.roleButtonSecondary}
          onClick={() => onSelectRole('kasir')}
        >
          {/* Ikon untuk Kasir */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Kasir
        </button>
      </div>
    </div>
  );
};


// ==========================================================
// KOMPONEN UTAMA HALAMAN (Struktur Baru)
// ==========================================================
export default function AuthPage() {
  // Logika state Anda untuk memilih tampilan tetap sama
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
    // Ini adalah wrapper utama halaman
    <div className={styles.loginPage}>
      {/* Ini adalah container 2 kolom: 
        1. Panel Biru (brandPanel)
        2. Panel Form (formPanel)
      */}
      <div className={styles.loginWrapper}>

        {/* 1. PANEL KIRI (BIRU) */}
        <div className={styles.brandPanel}>
          {/* Logo SVG yang rumit telah dihapus. */}
          <h1 className={styles.brandName}>Kantin Kita</h1>
          <span className={styles.footerText}>Since 2023</span>
        </div>

        {/* 2. PANEL KANAN (FORM) */}
        <div className={styles.formPanel}>
          {/* Kartu putih yang membungkus form */}
          <div className={styles.formWrapper}>
            
            {/* Render view (Pilih Peran atau Form Login) */}
            {renderView()}

          </div>
          <span className={styles.versionText}>v0.2.22</span>
        </div>
      </div>
    </div>
  );
}