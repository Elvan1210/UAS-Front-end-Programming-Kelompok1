"use client";

import Link from "next/link";
const ContentHeader = ({ title }: { title: string }) => {
    return (
      <header className="content-header">
        <h1>{title}</h1>
      </header>
    );
};

export default function MenuPage() {
  return (
    <>
      <ContentHeader title="Manajemen Menu" />
      <p className="text-muted fs-5 mb-4">Silakan pilih tindakan yang ingin Anda lakukan.</p>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card list-card h-100">
            <div className="card-body p-4 text-center">
              <i className="bi bi-plus-circle-dotted" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}></i>
              <h4 className="card-title fw-semibold mt-3">Input Menu Baru</h4>
              <p className="card-text text-muted">Gunakan halaman ini untuk mendaftarkan menu baru ke dalam sistem kasir Anda.</p>
              <Link href="/menu/input" className="btn btn-primary w-100 fw-bold mt-3">
                <i className="bi bi-plus-circle-fill"></i> Pergi ke Halaman Input
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card list-card h-100">
            <div className="card-body p-4 text-center">
              <i className="bi bi-pencil-square" style={{ fontSize: '4rem', color: 'var(--secondary-color)' }}></i>
              <h4 className="card-title fw-semibold mt-3">Lihat & Kelola Menu</h4>
              <p className="card-text text-muted">Lihat semua menu, ubah harga, nama, foto, kategori, atau hapus menu.</p>
              <Link href="/menu/kelola" className="btn btn-outline-secondary w-100 fw-bold mt-3">
                <i className="bi bi-pencil-square"></i> Pergi ke Halaman Kelola
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}