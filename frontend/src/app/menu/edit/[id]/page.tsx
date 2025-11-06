// File: frontend/src/app/menu/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface MenuItem {
  _id: string;
  nama: string;
  harga: string;
  gambar: string | null;
}

export default function EditMenuPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [menuData, setMenuData] = useState<MenuItem | null>(null);
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  
  // State untuk URL gambar yang sudah ada
  const [existingImageUrl, setExistingImageUrl] = useState(''); 
  // State untuk menampung file baru
  const [newFileGambar, setNewFileGambar] = useState<File | null>(null); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Basic protection fallback
    const token = localStorage.getItem('kasirToken');
    if (!token) {
        router.push('/login');
        return;
    }

    if (!id) return;

    const fetchMenu = async () => {
      try {
        const response = await fetch(`http://localhost:5000/menu/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Gagal memuat detail menu.');
        }

        setMenuData(data);
        setNama(data.nama);
        setHarga(data.harga);
        setExistingImageUrl(data.gambar || ''); 
      } catch (err) {
        setMessage('Gagal memuat menu. Silakan periksa koneksi server.');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setIsError(false);

    // MENGGUNAKAN FormData
    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('harga', harga);

    // Logika pengiriman gambar
    if (newFileGambar) {
        formData.append('gambar', newFileGambar); 
    } else if (!existingImageUrl) {
        // Mengirim string kosong ke backend jika user menghapus gambar lama
        formData.append('gambar', ''); 
    } 

    try {
      const response = await fetch(`http://localhost:5000/menu/update/${id}`, {
        method: 'PUT',
        body: formData, // Menggunakan FormData
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        throw new Error(data.message || 'Gagal mengupdate menu.');
      }

      setMessage('Menu berhasil diperbarui!');
      setSaving(false);
      
      setTimeout(() => {
        router.push('/menu/kelola');
      }, 1500);

    } catch (err: unknown) {
      setSaving(false);
      let errorMessage = 'Terjadi kesalahan saat menyimpan menu.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setMessage(errorMessage);
      setIsError(true);
    } 
  };

  if (loading) {
    return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className='mt-2'>Memuat data menu...</p>
        </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <h1 className="mb-4">Edit Menu: {menuData?.nama}</h1>

          <Link href="/menu/kelola" className="btn btn-outline-secondary btn-sm mb-4">
            ← Kembali ke Daftar Menu
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
                
                {/* --- BAGIAN GAMBAR --- */}
                <div className="mb-3">
                  <label className="form-label">Foto Menu Saat Ini:</label>
                  {existingImageUrl ? (
                    <div className="d-flex align-items-center mb-2">
                        <img 
                            src={existingImageUrl} 
                            alt={nama} 
                            style={{ width: '100px', height: 'auto' }} 
                            className="img-thumbnail me-3"
                        />
                        {/* Tombol Hapus Gambar Lama */}
                        <button 
                            type="button" 
                            className="btn btn-sm btn-danger"
                            onClick={() => setExistingImageUrl('')} 
                        >
                            Hapus Gambar Lama
                        </button>
                    </div>
                  ) : (
                    <p className="text-muted">Tidak ada foto terdaftar.</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="newGambarInput" className="form-label">Upload Foto Baru (Ganti)</label>
                  <input
                    type="file" // Input file baru
                    className="form-control"
                    id="newGambarInput"
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files) {
                            setNewFileGambar(e.target.files[0]); 
                            setExistingImageUrl(''); // Bersihkan URL lama jika memilih file baru
                        }
                    }}
                  />
                  {newFileGambar && (
                    <small className="text-muted mt-2">File baru dipilih: {newFileGambar.name}</small>
                  )}
                </div>
                {/* --- AKHIR BAGIAN GAMBAR YANG DIUBAH --- */}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={saving}
                >
                  {saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}