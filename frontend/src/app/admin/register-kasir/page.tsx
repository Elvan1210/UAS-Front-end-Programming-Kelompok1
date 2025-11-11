"use client";

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Dihapus untuk pratinjau
// import { useAuth } from '@/Context/AuthContext'; // Dihapus untuk pratinjau

// Asumsi URL Backend
const API_BASE_URL = 'http://localhost:5000/api/akun';

// ==========================================================
// KOMPONEN STYLE CSS (BARU & TER-ISOLASI)
// ==========================================================
// Style ini HANYA untuk form registrasi dan tidak akan
// mengganggu layout dashboard Anda.
const ScopedFormStyles = () => (
  <style>{`
    /* Wrapper (kotak putih) untuk form */
    .regFormContainer {
      background-color: white;
      padding: 2.5rem; /* 40px */
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      max-width: 600px; /* Batas lebar form */
      margin: 0 auto; /* Tengahkan form di area konten */
    }

    .regFormTitle {
      font-size: 1.8rem;
      font-weight: 600;
      color: #333;
      margin: 0;
      text-align: center;
      margin-bottom: 2rem;
    }

    .regErrorAlert {
      background-color: #ffebee;
      color: #c62828;
      padding: 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .regSuccessAlert {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .regInputGroup {
      margin-bottom: 1.5rem;
    }

    .regInputGroup label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #555;
      margin-bottom: 0.5rem;
    }

    .regInputField {
      width: 100%;
      padding: 0.9rem 1rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }

    .regInputField:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
    }

    .regSubmitButton {
      width: 100%;
      padding: 0.9rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      background-color: #3f51b5;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .regSubmitButton:hover {
      background-color: #303f9f;
    }

    .regSubmitButton:disabled {
      background-color: #9fa8da;
      cursor: not-allowed;
    }
  `}</style>
);


// ==========================================================
// KOMPONEN FORM REGISTER (Style Baru)
// ==========================================================
const RegisterKasirForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok!');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Otentikasi admin gagal. Silakan login ulang.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/register-kasir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mendaftar');
      }

      setSuccess(`Registrasi kasir (${email}) berhasil!`);
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    // Menggunakan class .regFormContainer baru
    <div className="regFormContainer">
      <h2 className="regFormTitle">
        Registrasi Akun Kasir
      </h2>

      {error && (
        <div className="regErrorAlert">
          {error}
        </div>
      )}
      {success && (
        <div className="regSuccessAlert">
          {success}
        </div>
      )}

      <form id="register-form" onSubmit={handleRegister}>
        <div className="regInputGroup">
          <label htmlFor="email">Email Kasir Baru</label>
          <input
            type="email"
            className="regInputField"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="contoh@email.com"
          />
        </div>
        
        <div className="regInputGroup">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="regInputField"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimal 6 karakter"
          />
        </div>

        <div className="regInputGroup">
          <label htmlFor="confirm-password">Konfirmasi Password</label>
          <input
            type="password"
            className="regInputField"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Ulangi password"
          />
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="regSubmitButton"
            disabled={loading}
          >
            {loading ? "Mendaftarkan..." : "Daftarkan Akun Kasir"}
          </button>
        </div>
      </form>
    </div>
  );
};


// ==========================================================
// KOMPONEN UTAMA HALAMAN (Style Diperbaiki)
// ==========================================================
export default function RegisterKasirPage() {
  // const { user, loading } = useAuth(); // Logika Auth dinonaktifkan untuk pratinjau
  // const router = useRouter(); // Logika Router dinonaktifkan untuk pratinjau

  // "PENJAGA" ADMIN (Logika tetap sama)
  /*
  useEffect(() => {
    if (loading) return; 
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      console.error("Akses ditolak. Hanya admin yang boleh mendaftarkan kasir.");
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  */

  // Tampilan Loading atau "Forbidden" (Disederhanakan)
  // Wrapper layout lama dihapus
  /*
  // Logika loading dinonaktifkan untuk pratinjau
  if (loading || !user) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>Mengecek otentikasi...</h3>
      </div>
    );
  }
  
  if (user.role !== 'admin') {
     return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>Akses Ditolak.</h3>
      </div>
    );
  }
  */

  // Tampilkan halaman HANYA JIKA ADMIN
  // Wrapper .formPanel dihapus, diganti padding sederhana
  return (
    // Beri padding agar form tidak menempel di tepi
    <div style={{ padding: '2rem' }}>
      {/* Menyuntikkan CSS yang ter-isolasi */}
      <ScopedFormStyles /> 
      
      <RegisterKasirForm />
    </div>
  );
}