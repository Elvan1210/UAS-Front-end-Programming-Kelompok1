"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";

// konfigurasi url api tambah menu
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/menu/add`;

export default function InputMenuPage() {
  // inisialisasi state untuk data form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // cek status login pengguna
  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push('/login');
  }, [user, authLoading, router]);

  // fungsi menangani submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    // persiapan data form untuk dikirim
    const formData = new FormData();
    formData.append('nama', name);
    formData.append('harga', price);
    formData.append('category', category);
    formData.append('stock', stock);
    if (fileGambar) formData.append('gambar', fileGambar);
    
    // validasi token otentikasi
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage({ type: 'danger', text: 'Sesi habis. Silakan login.' });
      router.push('/login');
      return;
    }

    // proses kirim data ke server
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menambahkan menu');
      setMessage({ type: 'success', text: 'Menu berhasil ditambahkan' });
      
      // reset form setelah berhasil
      setName('');
      setCategory('');
      setPrice('');
      setStock('');
      setFileGambar(null);

      const fileInput = document.getElementById('foto-produk') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => router.push('/menu/kelola'), 1500);
    } catch (error: any) {
      setMessage({ type: 'danger', text: error.message || 'Terjadi kesalahan' });
    } finally {
      setLoading(false);
    }
  };

  // tampilan saat memuat data
  if (authLoading || !user) {
    return <div style={{ textAlign: 'center', paddingTop: '4rem' }}><p style={{ color: '#666' }}>Memverifikasi akses...</p></div>;
  }

  // struktur utama halaman tambah menu
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '2rem', paddingBottom: '3rem' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
        
        {/* tombol kembali ke halaman menu */}
        <Link href="/menu" style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none', 
            color: '#1a1a1a', 
            fontSize: '0.95rem',
            marginBottom: '2rem',
            padding: '0.6rem 1.2rem',
            border: '1px solid #ced4da', 
            borderRadius: '8px',         
            backgroundColor: 'transparent',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = '#f1f3f5'; 
            e.currentTarget.style.borderColor = '#adb5bd';
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#ced4da';
          }}
        >
           <div style={{
             width: '26px',
             height: '26px',
             backgroundColor: '#495057', 
             borderRadius: '50%',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             marginRight: '0.8rem',
             color: '#fff', 
             fontSize: '0.9rem',
             paddingBottom: '2px'
           }}>
             ←
           </div>
          Kembali
        </Link>

        {/* judul halaman dan deskripsi */}
        <div style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '1px', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Tambah Menu Baru
          </h1>
          <div style={{ width: '40px', height: '1px', backgroundColor: '#d4af37', marginBottom: '1rem' }}></div>
          <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: '300' }}>
            Lengkapi formulir di bawah untuk menambahkan menu ke sistem
          </p>
        </div>

        {/* pesan notifikasi sukses atau gagal */}
        {message.text && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'danger' ? '#fee' : '#efe',
            border: `1px solid ${message.type === 'danger' ? '#dcc' : '#cec'}`,
            borderRadius: '2px',
            color: message.type === 'danger' ? '#a44' : '#4a4',
            fontSize: '0.9rem'
          }}>
            {message.text}
          </div>
        )}

        {/* container form utama */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: '2px', padding: '3rem' }}>
          <form onSubmit={handleSubmit}>
            
            {/* input nama menu dan kategori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                  Nama Menu <span style={{ color: '#c00' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Salmon Teriyaki"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    border: '1px solid #ddd',
                    borderRadius: '2px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                  Kategori <span style={{ color: '#c00' }}>*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    border: '1px solid #ddd',
                    borderRadius: '2px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Cemilan">Cemilan</option>
                </select>
              </div>
            </div>

            {/* input harga dan stok */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                  Harga (Rp) <span style={{ color: '#c00' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 250000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    border: '1px solid #ddd',
                    borderRadius: '2px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                  Stok Awal <span style={{ color: '#c00' }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 25"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    border: '1px solid #ddd',
                    borderRadius: '2px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            </div>

            {/* area upload foto */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                Foto Menu (Opsional)
              </label>
              <div
                style={{
                  border: '1px dashed #ccc',
                  borderRadius: '2px',
                  padding: '2.5rem',
                  textAlign: 'center',
                  backgroundColor: '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => document.getElementById('foto-produk')?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#999';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                  e.currentTarget.style.borderColor = '#ccc';
                }}
              >
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '400', color: '#1a1a1a', fontSize: '0.95rem' }}>
                  Klik atau drag file ke sini
                </p>
                <p style={{ margin: '0', color: '#999', fontSize: '0.85rem', fontWeight: '300' }}>
                  JPG, PNG - Maks 5MB
                </p>
              </div>
              <input
                type="file"
                id="foto-produk"
                accept="image/*"
                onChange={(e) => e.target.files && setFileGambar(e.target.files[0])}
                style={{ display: 'none' }}
              />
              {fileGambar && (
                <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#666', fontWeight: '300' }}>
                  File: {fileGambar.name}
                </p>
              )}
            </div>

            {/* tombol aksi simpan atau batal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <Link
                href="/menu"
                style={{
                  padding: '0.95rem',
                  backgroundColor: 'transparent',
                  color: '#1a1a1a',
                  border: '1px solid #1a1a1a',
                  borderRadius: '2px',
                  fontWeight: '400',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1a1a1a';
                }}
              >
                BATAL
              </Link>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.95rem',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #1a1a1a',
                  borderRadius: '2px',
                  fontWeight: '400',
                  fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.7 : 1,
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1a1a1a')}
              >
                {loading ? 'MENYIMPAN...' : 'SIMPAN MENU'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}