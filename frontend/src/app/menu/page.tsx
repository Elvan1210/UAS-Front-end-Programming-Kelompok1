"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// komponen header untuk judul halaman
const ContentHeader = ({ title }: { title: string }) => {
  return (
    <header className="mb-4 text-center">
      <h1 style={{ 
        fontSize: '2.8rem', 
        fontWeight: '700', 
        letterSpacing: '1px', 
        color: '#1a1a1a', 
        marginBottom: '0.5rem' 
      }}>
        {title}
      </h1>
      <div style={{ width: '80px', height: '3px', backgroundColor: '#d4af37', margin: '0 auto 1.5rem auto' }}></div>
      <p style={{ color: '#555', fontSize: '1rem', letterSpacing: '0.5px', fontWeight: '400' }}>
        Pilih opsi di bawah untuk mengatur sistem restoran
      </p>
    </header>
  );
};

// fungsi utama halaman menu
export default function MenuPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* css untuk mengatur margin responsif agar tampilan sesuai di desktop dan mobile */}
      <style jsx>{`
        .menu-page-wrapper {
          margin-left: -2.5rem;
          margin-right: -2.5rem;
          margin-bottom: -2.5rem;
          width: calc(100% + 5rem);
          min-height: calc(100vh + 2.5rem);
          position: relative;
          overflow: hidden;
          background-color: #ffffff;
        }

        @media (min-width: 992px) {
          .menu-page-wrapper {
            margin-top: -2.5rem; 
          }
        }

        @media (max-width: 991.98px) {
          .menu-page-wrapper {
            margin-top: 0; 
            width: calc(100% + 3rem); 
            margin-left: -1.5rem; 
            margin-right: -1.5rem;
          }
        }
      `}</style>

      {/* pembungkus utama seluruh konten halaman */}
      <div className="menu-page-wrapper">

        {/* elemen dekorasi latar belakang pola titik titik */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(#e0e0e0 1.5px, transparent 1.5px)', 
          backgroundSize: '24px 24px', 
          opacity: 0.6,
          zIndex: 0,
          pointerEvents: 'none'
        }}></div>

        {/* dekorasi lingkaran warna emas di pojok kanan atas */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(255,255,255,0) 70%)', 
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none',
        }}></div>

        {/* dekorasi lingkaran warna abu di pojok kiri bawah */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(26, 26, 26, 0.04) 0%, rgba(255,255,255,0) 70%)', 
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none',
        }}></div>

        {/* area konten utama di tengah layar */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',     
          justifyContent: 'center', 
          padding: '2rem',
          
          // efek animasi transisi saat halaman dimuat
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease-out'
        }}>
          
          <div style={{
            width: '100%',
            maxWidth: '700px', 
            padding: '1rem',   
          }}>
            
            <ContentHeader title="Manajemen Menu" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
              
              {/* tombol menu untuk halaman tambah data */}
              <Link href="/menu/input" style={{ textDecoration: 'none' }}>
                <div 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
                    backdropFilter: 'blur(8px)' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#d4af37'; 
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  <div style={{ 
                      minWidth: '70px', 
                      height: '70px', 
                      backgroundColor: '#1a1a1a', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: '1.5rem',
                      color: '#d4af37',
                      fontSize: '2rem',
                      fontWeight: '300',
                      flexShrink: 0
                  }}>
                    +
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.4rem', margin: 0 }}>
                      Tambah Menu Baru
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0', fontWeight: '400' }}>
                      Input menu baru lengkap dengan foto, harga, dan stok.
                    </p>
                  </div>
                </div>
              </Link>

              {/* tombol menu untuk halaman kelola database */}
              <Link href="/menu/kelola" style={{ textDecoration: 'none' }}>
                <div 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#d4af37';
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  <div style={{ 
                      minWidth: '70px', 
                      height: '70px', 
                      backgroundColor: '#fff', 
                      border: '2px solid #1a1a1a', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: '1.5rem',
                      color: '#1a1a1a',
                      fontSize: '1.8rem',
                      flexShrink: 0
                  }}>
                    ☰
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.4rem', margin: 0 }}>
                      Kelola Database
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0', fontWeight: '400' }}>
                      Edit, hapus, dan pantau stok menu yang tersedia.
                    </p>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}