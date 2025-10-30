'use client';

import Link from 'next/link';

export default function MenuPage() {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col">
          <h1>Manajemen Menu</h1>
          <p>Silakan pilih tindakan yang ingin Anda lakukan.</p>
        </div>
      </div>

      <div className="row mt-4 g-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Input Menu Baru</h5>
              <p className="card-text">
                Gunakan halaman ini untuk mendaftarkan menu baru ke dalam sistem
                kasir Anda.
              </p>
              <Link
                href="/menu/input"
                className="btn btn-primary mt-auto"
              >
                Pergi ke Halaman Input
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Lihat & Kelola Menu</h5>
              <p className="card-text">
                Lihat semua menu yang sudah ada. Anda bisa mengubah harga, nama,
                foto, atau menghapus menu.
              </p>
              <Link
                href="/menu/kelola"
                className="btn btn-secondary mt-auto"
              >
                Pergi ke Halaman Kelola
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}