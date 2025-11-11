"use client";

// 1. IMPORT 'useEffect' dan 'useAuth'
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext"; // <-- IMPORT AUTH

const API_URL = 'http://localhost:5000/menu/add'; 

const ContentHeader = ({ title }: { title: string }) => {
    return (
      <header className="content-header">
        <h1>{title}</h1>
      </header>
    );
};

export default function InputMenuPage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [fileGambar, setFileGambar] = useState<File | null>(null); 
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  // <-- 2. TAMBAHKAN PENJAGA AUTH
  const { user, loading: authLoading } = useAuth();

  // <-- 3. TAMBAHKAN 'useEffect' UNTUK PROTEKSI HALAMAN
  useEffect(() => {
    // Tunggu sampai auth selesai loading
    if (authLoading) {
      return; 
    }
    // Jika tidak ada user, "mental" ke login
    if (!user) {
      router.push('/login');
    }
    // Jika ada user, biarkan (tampilkan halaman)
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    
    formData.append('nama', name);
    formData.append('harga', price);
    formData.append('category', category); 
    formData.append('stock', stock);

    if (fileGambar) {
      formData.append('gambar', fileGambar); 
    }
    
    // <-- 4. PERBAIKI NAMA TOKEN DI SINI
    const token = localStorage.getItem('authToken'); // <-- UBAH DARI 'kasirToken'
    
    if (!token) {
      // Seharusnya ini tidak akan terjadi karena sudah dijaga 'useEffect'
      // Tapi kita biarkan sebagai pengaman ganda
      setMessage({ type: 'danger', text: 'Sesi habis. Silakan login.' });
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData, 
        headers: {
            'Authorization': `Bearer ${token}`, // <-- Token ini sekarang benar
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menambahkan menu');
      }

      setMessage({ type: 'success', text: 'Menu baru berhasil ditambahkan!' });
      setName('');
      setCategory('');
      setPrice('');
      setStock('');
      setFileGambar(null);
      
      // Reset input file (cara standar)
      const fileInput = document.getElementById('foto-produk') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      setLoading(false);

    } catch (error: any) {
        setLoading(false);
        setMessage({ type: 'danger', text: error.message || 'Terjadi kesalahan' });
    }
  };

  // <-- 5. TAMBAHKAN GERBANG LOADING AUTH
  // Ini mencegah "kedipan" form sebelum redirect
  if (authLoading || !user) {
    return (
      <div className="container mt-5 text-center">
        <h3>Mengecek otentikasi...</h3>
      </div>
    );
  }

  // <-- 6. TAMPILKAN HALAMAN JIKA SUDAH LOLOS
  return (
    <div className="container mt-5">
      <ContentHeader title="Input Menu Baru" />
      <Link href="/menu" className="btn btn-outline-secondary mb-3">
        <i className="bi bi-arrow-left-circle-fill"></i> Kembali
      </Link>

      <div className="content-card">
        {message.text && (
          <div className={`alert alert-${message.type === 'danger' ? 'danger' : 'success'}`} role="alert">
            {message.text}
          </div>
        )}
        <form id="form-tambah-produk" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="nama-produk" className="form-label">Nama Menu</label>
              <input 
                type="text" 
                className="form-control" 
                id="nama-produk" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="kategori-produk" className="form-label">Kategori</label>
              <select 
                className="form-select" 
                id="kategori-produk" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Pilih Kategori...</option>
                <option value="Makanan">Makanan</option>
                <option value="Minuman">Minuman</option>
                <option value="Cemilan">Cemilan</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="harga-produk" className="form-label">Harga (Rp)</label>
              <input 
                type="text" // Anda mungkin mau ganti ke "number"
                className="form-control" 
                id="harga-produk" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required 
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="stok-produk" className="form-label">Stok Awal</label>
              <input 
                type="number" 
                className="form-control" 
                id="stok-produk" 
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="foto-produk" className="form-label">Upload Foto Menu (Opsional)</label>
            <input 
              type="file"
              className="form-control" 
              id="foto-produk" 
              accept="image/*"
              onChange={(e) => {
                  if (e.target.files) {
                      setFileGambar(e.target.files[0]);
                  }
              }}
            />
            {fileGambar && (
                <small className="text-muted mt-2">File dipilih: {fileGambar.name}</small>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary fw-bold"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan Menu Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}