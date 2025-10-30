'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MenuItem {
  _id: string;
  nama: string;
  harga: string;
  gambar: string | null;
}

export default function KelolaMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const fetchMenus = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/menu/');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengambil data menu.');
      }
      
      setMenus(data);
    } catch (err: unknown) {
      let errorMessage = 'Gagal memuat menu. Server mungkin mati.';
      if (err instanceof Error) {
        errorMessage = errorMessage.includes('Gagal memuat') ? errorMessage : err.message;
      }
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic protection fallback
    const token = localStorage.getItem('kasirToken');
    if (!token) {
        router.push('/login');
    }
    fetchMenus();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan.')) return;

    setMessage('');
    setIsError(false);
    
    try {
      const response = await fetch(`http://localhost:5000/menu/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menghapus menu.');
      }

      setMenus(menus.filter(menu => menu._id !== id));
      setMessage(data.message);
      setIsError(false);

    } catch (err: unknown) {
      let errorMessage = 'Gagal menghapus menu. Silakan coba lagi.';
      if (err instanceof Error) {
        errorMessage = errorMessage.includes('Gagal menghapus') ? errorMessage : err.message;
      }
      setMessage(errorMessage);
      setIsError(true);
    }
  };


  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Daftar Menu Tersedia</h1>
        <Link href="/menu" className="btn btn-outline-secondary btn-sm">
            ← Kembali ke Menu Utama
        </Link>
      </div>

      {message && (
        <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`} role="alert">
          {message}
        </div>
      )}
      
      <Link href="/menu/input" className="btn btn-success mb-4">
        + Tambah Menu Baru
      </Link>

      {loading && (
        <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Memuat...</span>
            </div>
            <p className='mt-2'>Memuat data menu...</p>
        </div>
      )}

      {!loading && menus.length === 0 && !isError && (
        <div className="alert alert-info text-center">
            Belum ada menu yang terdaftar. Silakan tambah menu baru!
        </div>
      )}

      {!loading && menus.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nama Menu</th>
                <th scope="col">Harga</th>
                <th scope="col">Foto</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu, index) => (
                <tr key={menu._id}>
                  <th scope="row">{index + 1}</th>
                  <td>{menu.nama}</td>
                  <td>Rp {menu.harga}</td>
                  <td>
                    {menu.gambar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={menu.gambar} alt={menu.nama} style={{ width: '80px', height: 'auto' }} className="img-thumbnail" />
                    ) : (
                      <span className="text-muted">Tidak ada foto</span>
                    )}
                  </td>
                  <td>
                    <Link 
                        href={`/menu/edit/${menu._id}`} 
                        className="btn btn-sm btn-info me-2"
                    >
                        Edit
                    </Link>
                    <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(menu._id)}
                    >
                        Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}