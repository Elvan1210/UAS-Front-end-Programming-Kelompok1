// app/dashboard/page.tsx (VERSI PERBAIKAN - FIXED DATA FETCHING)
"use client";

import { useEffect, useState } from "react";
import { PersonCircle } from 'react-bootstrap-icons';

const ContentHeader = ({ title }: { title: string }) => {
  const [userEmail, setUserEmail] = useState("Loading...");

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    setUserEmail(user || "Tamu");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = '/login';
  };

  return (
    <header className="content-header">
      <h1>{title}</h1>
      <div className="header-actions">
        <div className="user-profile dropdown">
          <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <PersonCircle size={32} className="me-2 text-secondary" />
            <span id="user-display-email">{userEmail}</span>
          </a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><a className="dropdown-item logout-link" href="#" onClick={handleLogout}>Logout</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const formatTransactionId = (id: string) => {
  return `TRX${id.slice(-5).toUpperCase()}`;
};

interface Product {
  _id: string;
  nama: string;
  gambar: string;
  harga: number;
  stock: number;
}

interface PopularMenuItem {
  name: string;
  quantity: number;
  image: string;
}

interface RecentOrder {
  _id: string;
  createdAt: string;
  totalPrice: number;
  items: {
    nama: string;
    quantity: number;
  }[];
}

export default function DashboardPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [popularMenu, setPopularMenu] = useState<PopularMenuItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Ambil data transaksi - PERBAIKAN ENDPOINT
      console.log('📡 Fetching transactions...');
      const transRes = await fetch(`${API_URL}/api/transactions`);
      const transactionData = await transRes.json();
      
      console.log('📦 Transaction Response:', transactionData);

      // PERBAIKAN: Handle response structure yang benar
      let allTransactions = [];
      if (transactionData.success && Array.isArray(transactionData.data)) {
        allTransactions = transactionData.data;
      } else if (Array.isArray(transactionData)) {
        allTransactions = transactionData;
      } else {
        console.warn('⚠️ Format respons transaksi tidak dikenali:', transactionData);
        allTransactions = [];
      }

      console.log(`✅ Loaded ${allTransactions.length} transactions`);

      // 2. Ambil data produk
      console.log('📡 Fetching products...');
      const prodRes = await fetch(`${API_URL}/menu`);
      const allProducts: Product[] = await prodRes.json();
      setTotalProducts(allProducts.length || 0);
      console.log(`✅ Loaded ${allProducts.length} products`);

      // 3. Filter transaksi hari ini
      const todayStr = new Date().toISOString().split('T')[0];
      const todayTransactions = allTransactions.filter((tx: any) => {
        if (!tx.createdAt) return false;
        const txDate = tx.createdAt.split('T')[0];
        return txDate === todayStr;
      });

      console.log(`📊 Today's transactions: ${todayTransactions.length}`);

      // 4. Hitung pendapatan hari ini
      const revenueToday = todayTransactions.reduce((sum: number, tx: any) => 
        sum + (tx.totalPrice || 0), 0
      );
      setTotalRevenue(revenueToday);
      setTotalOrders(todayTransactions.length);

      // 5. Hitung menu populer (dari transaksi hari ini)
      const itemCounts: { [key: string]: number } = {};
      todayTransactions.forEach((tx: any) => {
        if (tx.items && Array.isArray(tx.items)) {
          tx.items.forEach((item: any) => {
            const itemName = item.nama || item.name || 'Unknown';
            itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.quantity || 0);
          });
        }
      });

      // 6. Map menu populer dengan gambar
      const sortedPopular = Object.entries(itemCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([name, quantity]) => {
          const product = allProducts.find((p: Product) => p.nama === name);
          return { 
            name, 
            quantity: quantity as number, 
            image: product?.gambar || 'https://via.placeholder.com/50'
          };
        });
      setPopularMenu(sortedPopular);

      console.log('🏆 Popular menu items:', sortedPopular);

      // 7. Ambil pesanan terbaru (5 terakhir dari SEMUA transaksi)
      const sortedRecent = [...allTransactions]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentOrders(sortedRecent);

      console.log('📋 Recent orders:', sortedRecent);

    } catch (error) {
      console.error("❌ Gagal mengambil data dashboard:", error);
      setError("Gagal memuat data. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto refresh setiap 30 detik
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tampilkan error jika ada
  if (error) {
    return (
      <>
        <ContentHeader title="Dashboard" />
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchData}
          >
            Coba Lagi
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Dashboard" />

      {/* Statistics Cards */}
      <section className="row mb-4">
        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card stat-card h-100 shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="icon-circle bg-primary text-white me-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '24px' }}>
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="card-title text-muted mb-1" style={{ fontSize: '14px' }}>Total Pendapatan (Hari Ini)</h6>
                <p className="card-text fw-bold mb-0" style={{ fontSize: '24px', color: '#333' }}>
                  {loading ? '...' : formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card stat-card h-100 shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="icon-circle bg-success text-white me-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '24px' }}>
                <i className="bi bi-receipt"></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="card-title text-muted mb-1" style={{ fontSize: '14px' }}>Total Transaksi (Hari Ini)</h6>
                <p className="card-text fw-bold mb-0" style={{ fontSize: '24px', color: '#333' }}>
                  {loading ? '...' : totalOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card stat-card h-100 shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="icon-circle bg-warning text-white me-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '24px' }}>
                <i className="bi bi-archive-fill"></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="card-title text-muted mb-1" style={{ fontSize: '14px' }}>Total Produk Terdaftar</h6>
                <p className="card-text fw-bold mb-0" style={{ fontSize: '24px', color: '#333' }}>
                  {loading ? '...' : totalProducts}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Populer & Pesanan Terbaru */}
      <section className="row">
        {/* Menu Populer */}
        <div className="col-lg-7 mb-4">
          <div className="card list-card h-100 shadow-sm border-0">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">Menu Populer (Hari Ini)</h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {popularMenu.length === 0 ? (
                    <li className="list-group-item text-muted text-center py-4">
                      Belum ada penjualan hari ini.
                    </li>
                  ) : (
                    popularMenu.map((item, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center py-3">
                        <div className="d-flex align-items-center flex-grow-1">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              marginRight: '15px',
                              border: '2px solid #f0f0f0'
                            }}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/50';
                            }}
                          />
                          <span className="fw-semibold">{item.name}</span>
                        </div>
                        <span className="badge bg-primary rounded-pill" style={{ fontSize: '14px', padding: '8px 16px' }}>
                          {item.quantity}x
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Pesanan Terbaru */}
        <div className="col-lg-5 mb-4">
          <div className="card list-card h-100 shadow-sm border-0">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">Pesanan Terbaru</h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {recentOrders.length === 0 ? (
                    <li className="list-group-item text-muted text-center py-4">
                      Belum ada transaksi.
                    </li>
                  ) : (
                    recentOrders.map((tx) => (
                      <li key={tx._id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                        <div>
                          <span className="fw-bold d-block">{formatTransactionId(tx._id)}</span>
                          <small className="text-muted">
                            {tx.items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)} item
                          </small>
                        </div>
                        <span className="text-success fw-bold">
                          {formatCurrency(tx.totalPrice)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}