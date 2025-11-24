'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// konfigurasi dasar url api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// definisi tipe data untuk objek menu
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

  // inisialisasi state untuk data formulir dan status aplikasi
  const [menuData, setMenuData] = useState<MenuItem | null>(null);
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [newFileGambar, setNewFileGambar] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // efek samping untuk memuat data menu dan cek otentikasi
  useEffect(() => {
    const token = localStorage.getItem('kasirToken');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!id) return;

    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Gagal memuat detail menu.');

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

  // fungsi untuk menangani pengiriman formulir
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setIsError(false);

    // persiapan data formulir untuk dikirim
    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('harga', harga);

    if (newFileGambar) {
      formData.append('gambar', newFileGambar);
    } else if (!existingImageUrl) {
      formData.append('gambar', '');
    }

    // proses pengiriman data ke server
    try {
      const response = await fetch(`${API_BASE_URL}/menu/update/${id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gagal mengupdate menu.');

      setMessage('Menu berhasil diperbarui');
      setSaving(false);
      setTimeout(() => {
        router.push('/menu/kelola');
      }, 1500);
    } catch (err: unknown) {
      setSaving(false);
      let errorMessage = 'Terjadi kesalahan saat menyimpan menu.';
      if (err instanceof Error) errorMessage = err.message;
      setMessage(errorMessage);
      setIsError(true);
    }
  };

  // tampilan saat data sedang dimuat
  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#666', fontWeight: '300' }}>Memuat data menu...</p>
      </div>
    );
  }

  // struktur utama tampilan halaman edit
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
        
        {/* tombol kembali ke halaman sebelumnya */}
        <Link href="/menu/kelola" style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            color: '#1a1a1a',
            textDecoration: 'none', 
            fontSize: '0.9rem', 
            marginBottom: '2rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '50px',
            border: '1px solid #e0e0e0',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e6ea'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
        >
          ← Kembali
        </Link>

        <div style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '300', letterSpacing: '1px', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Edit Menu
          </h1>
          <div style={{ width: '40px', height: '1px', backgroundColor: '#d4af37', marginBottom: '1rem' }}></div>
          <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: '300' }}>
            {menuData?.nama}
          </p>
        </div>

        {/* area notifikasi pesan sukses atau error */}
        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: isError ? '#fee' : '#efe',
            border: `1px solid ${isError ? '#dcc' : '#cec'}`,
            borderRadius: '2px',
            color: isError ? '#a44' : '#4a4',
            fontSize: '0.9rem'
          }}>
            {message}
          </div>
        )}

        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: '2px', padding: '3rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                Nama Menu <span style={{ color: '#c00' }}>*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
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

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                Harga (Rp) <span style={{ color: '#c00' }}>*</span>
              </label>
              <input
                type="text"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
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

            {/* bagian menampilkan gambar yang sudah ada */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                Foto Menu Saat Ini
              </label>
              {existingImageUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <img
                    src={existingImageUrl}
                    alt={nama}
                    style={{
                      width: '100%',
                      maxWidth: '250px',
                      height: 'auto',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                      border: '1px solid #e8e8e8',
                      display: 'block'
                    }}
                  />
                  {/* tombol untuk menghapus foto saat ini */}
                  <button
                    type="button"
                    onClick={() => setExistingImageUrl('')}
                    style={{
                      backgroundColor: '#fff',
                      color: '#c00',
                      border: '1px solid #c00',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      width: '250px' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#c00';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.color = '#c00';
                    }}
                  >
                    × Hapus Foto Ini
                  </button>
                </div>
              ) : (
                <div style={{ padding: '1rem', backgroundColor: '#fafafa', border: '1px dashed #ccc', borderRadius: '4px', color: '#999', fontSize: '0.9rem' }}>
                  Tidak ada foto terdaftar
                </div>
              )}
            </div>

            {/* area untuk mengunggah foto baru */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                Upload Foto Baru / Ganti
              </label>
              <div
                style={{
                  border: '1px dashed #ccc',
                  borderRadius: '2px',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => document.getElementById('newGambarInput')?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#999';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                  e.currentTarget.style.borderColor = '#ccc';
                }}
              >
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: '400', color: '#1a1a1a', fontSize: '0.95rem' }}>
                  Klik atau drag file ke sini
                </p>
                <p style={{ margin: '0', color: '#999', fontSize: '0.85rem', fontWeight: '300' }}>
                  JPG, PNG - Maks 5MB
                </p>
              </div>
              <input
                type="file"
                id="newGambarInput"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setNewFileGambar(e.target.files[0]);
                    setExistingImageUrl('');
                  }
                }}
                style={{ display: 'none' }}
              />
              {newFileGambar && (
                <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#666', fontWeight: '300' }}>
                   File Terpilih: <strong>{newFileGambar.name}</strong>
                </p>
              )}
            </div>

            {/* tombol aksi untuk batal atau simpan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <Link
                href="/menu/kelola"
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
                disabled={saving}
                style={{
                  padding: '0.95rem',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #1a1a1a',
                  borderRadius: '2px',
                  fontWeight: '400',
                  fontSize: '0.9rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: saving ? 0.7 : 1,
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = '#1a1a1a')}
              >
                {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}