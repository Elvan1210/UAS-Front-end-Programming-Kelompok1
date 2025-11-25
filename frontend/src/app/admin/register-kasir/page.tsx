"use client";

// impor dependensi
import { useState, useEffect } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { useRouter } from 'next/navigation';

// konfigurasi url api
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/akun`;

// komponen halaman registrasi kasir
export default function RegisterKasirPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // state untuk visibilitas password
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // cek otentikasi admin
  useEffect(() => {
    if (!authLoading) {
        if (!user) {
            router.push('/login');
        } else if (user.role !== 'admin') {
            router.push('/dashboard');
        }
    }
  }, [user, authLoading, router]);

  // fungsi menangani proses registrasi
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

      setSuccess(`Berhasil mendaftarkan kasir baru: ${email}`);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
    }
  };

  if (authLoading) return null;

  // render form registrasi
  return (
    <div className="container-fluid py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '85vh', backgroundColor: '#fff' }}>
      
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            
            <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: '24px' }}>
              
                {/* bagian header form */}
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" 
                        style={{
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            backgroundColor: '#F0FDF4',
                            color: '#131313'
                        }}>
                        <i className="bi bi-person-plus-fill" style={{fontSize: '2.5rem'}}></i>
                     </div>
                    <h2 className="fw-bold text-dark mb-1">Registrasi Kasir</h2>
                    <p className="text-muted small">Buat akun login untuk staf kasir baru</p>
                </div>

                {/* area pesan notifikasi */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center rounded-3 small fade show" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
                        <div>{error}</div>
                    </div>
                )}
                {success && (
                    <div className="alert alert-success d-flex align-items-center rounded-3 small fade show" role="alert">
                        <i className="bi bi-check-circle-fill me-2 flex-shrink-0"></i>
                        <div>{success}</div>
                    </div>
                )}

                <form onSubmit={handleRegister}>
                     {/* input email */}
                    <div className="mb-3">
                        <label className="form-label fw-bold small text-secondary">Email Kasir</label>
                        <div className="input-group">
                             <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                                <i className="bi bi-envelope"></i>
                            </span>
                            <input
                                type="email"
                                className="form-control border-start-0 py-2 rounded-end-3"
                                placeholder="nama@kantin.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{boxShadow: 'none'}}
                            />
                        </div>
                    </div>

                    {/* input password */}
                    <div className="mb-3">
                        <label className="form-label fw-bold small text-secondary">Password</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                                <i className="bi bi-lock"></i>
                             </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control border-start-0 border-end-0 py-2"
                                placeholder="Minimal 6 karakter"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{boxShadow: 'none'}}
                            />
                            <button 
                                className="btn bg-white border border-start-0 text-muted rounded-end-3" 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* input konfirmasi password */}
                    <div className="mb-4">
                        <label className="form-label fw-bold small text-secondary">Ulangi Password</label>
                        <div className="input-group">
                           <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                                <i className="bi bi-lock-fill"></i>
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control border-start-0 py-2 rounded-end-3"
                                placeholder="Ketik ulang password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={{boxShadow: 'none'}}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-100 py-3 fw-bold text-white rounded-3 shadow-sm"
                        style={{
                            backgroundColor: '#1C46F5',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1535b3'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C46F5'}
                    >
                        {loading ? (
                            <span><span className="spinner-border spinner-border-sm me-2"></span>Memproses...</span>
                        ) : (
                            <span><i className="bi bi-person-plus me-2"></i> Daftarkan Akun</span>
                        )}
                    </button>
                </form>
            </div>

        </div>
      </div>
    </div>
  );
}