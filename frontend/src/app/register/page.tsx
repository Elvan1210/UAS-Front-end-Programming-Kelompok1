'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/akun/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mendaftar'); 
      }
      
      alert('Registrasi berhasil!');
      router.push('/login');

    } catch (err: unknown) {
        setLoading(false);
        let errorMessage = 'Terjadi kesalahan saat registrasi.';
        
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        
        setError(errorMessage);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3>Registrasi Akun Kasir</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="passwordInput" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6} 
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100" 
                  disabled={loading} 
                >
                  {loading ? 'Mendaftar...' : 'Daftar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}