'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InputMenuPage() {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [gambar, setGambar] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    const token = localStorage.getItem('kasirToken');
    if (!token) {
      alert('Sesi habis. Silakan login kembali.');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/menu/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama,
          harga,
          gambar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        throw new Error(data.message || 'Gagal menambahkan menu.');
      }

      setMessage('Menu berhasil ditambahkan!');
      setNama('');
      setHarga('');
      setGambar('');
      setLoading(false);

    } catch (err: unknown) {
      setLoading(false);
      let errorMessage = 'Terjadi kesalahan saat menyimpan menu.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setMessage(errorMessage);
      setIsError(true);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <h1 className="mb-4">Input Menu Baru</h1>

          <Link href="/menu" className="btn btn-outline-secondary btn-sm mb-4">
            ← Kembali ke Manajemen Menu
          </Link>

          {message && (
            <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`} role="alert">
              {message}
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="namaInput" className="form-label">Nama Makanan/Minuman</label>
                  <input
                    type="text"
                    className="form-control"
                    id="namaInput"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="hargaInput" className="form-label">Harga (Contoh: 25000)</label>
                  <input
                    type="text" 
                    className="form-control"
                    id="hargaInput"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="gambarInput" className="form-label">URL Foto/Gambar (Opsional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="gambarInput"
                    value={gambar}
                    onChange={(e) => setGambar(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Tambah Menu'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}