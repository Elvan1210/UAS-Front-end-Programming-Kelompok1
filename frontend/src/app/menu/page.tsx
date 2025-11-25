"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';

// Header yang selaras dengan halaman lain
const ContentHeader = ({ title }: { title: string }) => {
  return (
    <header className="mb-5 text-center">
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: '800', 
        letterSpacing: '-1px', 
        color: '#131313', 
        marginBottom: '0.5rem' 
      }}>
        {title}
      </h1>
      <div style={{ width: '60px', height: '5px', backgroundColor: '#131313', margin: '0 auto 1rem auto', borderRadius: '4px' }}></div>
      <p style={{ color: '#666', fontSize: '1rem' }}>
        Pilih opsi di bawah untuk mengatur sistem restoran
      </p>
    </header>
  );
};

export default function MenuPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      
      <div style={{ width: '100%', maxWidth: '800px', padding: '2rem' }}>
        
        <ContentHeader title="Manajemen Menu" />

        <div className="row g-4 mt-2 justify-content-center">
          
          {/* === TOMBOL TAMBAH MENU === */}
          <div className="col-md-6">
            <Link href="/menu/input" style={{ textDecoration: 'none' }}>
              <div 
                className="card h-100 border-0 shadow-sm p-4 text-center d-flex flex-column align-items-center justify-content-center"
                style={{ 
                    backgroundColor: '#F8F9FA', // Abu sangat muda
                    borderRadius: '24px', 
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid #eee'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.border = '1px solid #D2FF52'; // Border Lime saat hover
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                    e.currentTarget.style.border = '1px solid #eee';
                }}
              >
                <div style={{ 
                    width: '80px', height: '80px', 
                    backgroundColor: '#131313', // Lingkaran Hitam
                    borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem', color: '#D2FF52', fontSize: '2.5rem'
                }}>
                  <i className="bi bi-plus-lg"></i>
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#131313', marginBottom: '0.5rem' }}>
                  Tambah Menu Baru
                </h3>
                <p style={{ color: '#666', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                  Input menu baru lengkap dengan foto, harga, dan stok awal.
                </p>
              </div>
            </Link>
          </div>

          {/* === TOMBOL KELOLA DATABASE === */}
          <div className="col-md-6">
            <Link href="/menu/kelola" style={{ textDecoration: 'none' }}>
              <div 
                className="card h-100 border-0 shadow-sm p-4 text-center d-flex flex-column align-items-center justify-content-center"
                style={{ 
                    backgroundColor: '#F8F9FA', 
                    borderRadius: '24px', 
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid #eee'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                    e.currentTarget.style.border = '1px solid #D2FF52';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                    e.currentTarget.style.border = '1px solid #eee';
                }}
              >
                <div style={{ 
                    width: '80px', height: '80px', 
                    backgroundColor: '#fff', 
                    border: '2px solid #131313', // Lingkaran Putih Border Hitam
                    borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem', color: '#131313', fontSize: '2rem'
                }}>
                  <i className="bi bi-database-fill-gear"></i>
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#131313', marginBottom: '0.5rem' }}>
                  Kelola Database
                </h3>
                <p style={{ color: '#666', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                  Edit, hapus, dan pantau stok menu yang tersedia saat ini.
                </p>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}