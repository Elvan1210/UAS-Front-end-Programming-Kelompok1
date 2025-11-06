"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    
    const token = localStorage.getItem('kasirToken');
    if (!token) {
      setMessage({ type: 'danger', text: 'Sesi habis. Silakan login.' });
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData, 
        headers: {
            'Authorization': `Bearer ${token}`,
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menambahkan menu');
      }

      setMessage({ type: 'success', text: 'Menu baru berhasil ditambahkan dan gambar diupload!' });
      setName('');
      setCategory('');
      setPrice('');
      setStock('');
      setFileGambar(null);
      setLoading(false);

    } catch (error: any) {
        setLoading(false);
        setMessage({ type: 'danger', text: error.message || 'Terjadi kesalahan' });
    }
  };

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
                type="text" 
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