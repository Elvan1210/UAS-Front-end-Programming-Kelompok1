"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/Context/AuthContext'; // <-- 1. Import useAuth

// Asumsi URL Backend
const API_BASE_URL = 'http://localhost:5000/api/akun'; 

// ==========================================================
// KOMPONEN FORM REGISTER (DIAMBIL DARI LOGIN PAGE LAMA)
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

    // 2. Ambil token Admin dari localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Otentikasi admin gagal. Silakan login ulang.');
      setLoading(false);
      return;
    }

    try {
      // 3. Panggil endpoint BARU '/register-kasir'
      const res = await fetch(`${API_BASE_URL}/register-kasir`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 4. KIRIM TOKEN ADMIN UNTUK OTORISASI
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
      // Kosongkan form
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <>
      <h2 className="text-center fw-bold mb-4">Registrasi Akun Kasir</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}
      <form id="register-form" onSubmit={handleRegister}>
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Email Kasir Baru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="email">Email Kasir Baru</label>
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
        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            id="confirm-password"
            placeholder="Konfirmasi Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label htmlFor="confirm-password">Konfirmasi Password</label>
        </div>
        <div className="d-grid">
          <button 
            type="submit" 
            className="btn btn-success btn-lg fw-bold"
            disabled={loading}
          >
            {loading ? "Mendaftarkan..." : "Daftarkan Akun Kasir"}
          </button>
        </div>
      </form>
    </>
  );
};


// ==========================================================
// KOMPONEN UTAMA HALAMAN (DENGAN PENJAGA ADMIN)
// ==========================================================
export default function RegisterKasirPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 5. "PENJAGA" ADMIN
  useEffect(() => {
    if (loading) return; // Tunggu loading selesai

    // 6. Jika tidak ada user, tendang ke login
    if (!user) {
      router.push('/login');
      return;
    }

    // 7. Jika user BUKAN admin, tendang ke dashboard
    if (user.role !== 'admin') {
      // (Beri pesan error atau langsung tendang)
      console.error("Akses ditolak. Hanya admin yang boleh mendaftarkan kasir.");
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // 8. Tampilkan loading atau "Forbidden"
  if (loading || !user) {
    return <div className="container mt-5 text-center"><h3>Mengecek otentikasi...</h3></div>;
  }
  
  if (user.role !== 'admin') {
     return <div className="container mt-5 text-center"><h3>Akses Ditolak.</h3></div>;
  }

  // 9. Tampilkan halaman HANYA JIKA ADMIN
  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-md-5">
              <RegisterKasirForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}