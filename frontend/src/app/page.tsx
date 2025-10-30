//import Image from "next/image";
//import styles from "./page.module.css";
import Link from 'next/link';
export default function Home() {
  return (
    <main className="container mt-5">
      <div className="alert alert-success" role="alert">
        Halo! Bootstrap 5 berhasil terpasang di Next.js.
      </div>

      <h1>Aplikasi Kasir UMKM</h1>
      <p>Ini adalah halaman utama (homepage) kita.</p>
      
      <Link href="/login" className="btn btn-success me-2">
        Pergi ke Halaman Login
      </Link>

      <Link href="/register" className="btn btn-info">
        Pergi ke Halaman Registrasi
      </Link>
      
    </main>
  );
}