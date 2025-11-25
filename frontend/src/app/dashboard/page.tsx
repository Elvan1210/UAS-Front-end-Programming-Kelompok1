"use client";

// impor library yang dibutuhkan
import { useEffect, useState } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// fungsi format mata uang
const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(number);
};

const formatTransactionId = (id: string) => `#TRX-${id.slice(-4).toUpperCase()}`;

// definisi tipe data
interface Product { _id: string; nama: string; gambar: string; harga: number; stock: number; }
interface PopularMenuItem { name: string; quantity: number; image: string; }
interface RecentOrder { _id: string; createdAt: string; totalPrice: number; items: { nama: string; quantity: number; }[]; }

// komponen header responsif
const ContentHeader = ({ title }: { title: string }) => {
  const [userData, setUserData] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    try {
      const storedUserStr = localStorage.getItem("loggedInUser");
      const storedRole = localStorage.getItem("userRole"); 
      
      if (storedUserStr) {
        if (storedUserStr.startsWith('{')) {
            const parsed = JSON.parse(storedUserStr);
            setUserData(parsed);
        } else {
            let detectedRole = 'kasir'; 
            if (storedRole) detectedRole = storedRole;
            else if (storedUserStr.toLowerCase().includes('admin')) detectedRole = 'admin';
            setUserData({ email: storedUserStr, role: detectedRole }); 
        }
      } else {
         setUserData({ email: 'Tamu', role: 'guest' });
      }
    } catch (e) {
      setUserData({ email: 'User', role: 'kasir' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole"); 
    window.location.href = '/login';
  };

  const role = userData?.role || 'User';
  const greetingName = role.charAt(0).toUpperCase() + role.slice(1); 
  const email = userData?.email || 'Loading...';

  return (
    // tata letak header responsif
    <header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end mb-5 gap-3">
      <div>
          <h1 className="m-0" style={{
              fontSize: '2.2rem', 
              fontWeight: '800', 
              color: '#131313',
              letterSpacing: '-0.5px'
          }}>
            {title}
          </h1>
          {/* garis aksen merah */}
          <div className="mt-2" style={{width: '60px', height: '5px', background: '#E03348', borderRadius: '4px'}}></div>
      </div>

      <div className="header-actions align-self-end align-self-md-auto">
        <div className="dropdown">
          <div 
            className="user-chip dropdown-toggle d-flex align-items-center gap-3 px-2 pe-4 py-2" 
            data-bs-toggle="dropdown" 
            style={{
                backgroundColor: '#FFFFFF', 
                borderRadius: '50px',       
                cursor: 'pointer',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                color: '#333'
            }}
          >
            <div className="d-flex align-items-center justify-content-center text-white" 
                 style={{
                    width: '42px', 
                    height: '42px', 
                    backgroundColor: '#E55466',
                    borderRadius: '50%',
                    fontSize: '1.2rem'
                 }}>
                <i className="bi bi-person-fill"></i>
            </div>

            <div className="d-flex flex-column" style={{lineHeight: '1.1'}}>
                <span className="fw-bold text-dark" style={{fontSize: '0.95rem'}}>Halo, {greetingName}</span>
                <span className="text-muted text-truncate" style={{fontSize: '0.75rem', maxWidth: '120px'}}>{email}</span>
            </div>
            <i className="bi bi-chevron-down ms-2 text-muted" style={{fontSize: '0.7rem'}}></i>
          </div>

          <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg mt-2 rounded-4 overflow-hidden">
             <li><a className="dropdown-item py-2 px-3 text-danger fw-bold" href="#" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i> Logout</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
};

// komponen halaman dashboard utama
export default function DashboardPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [popularMenu, setPopularMenu] = useState<PopularMenuItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fungsi ambil data dari api
  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const transRes = await fetch(`${API_URL}/api/transactions`);
      const transactionData = await transRes.json();
      let allTransactions = [];
      if (transactionData.success && Array.isArray(transactionData.data)) allTransactions = transactionData.data;
      else if (Array.isArray(transactionData)) allTransactions = transactionData;

      const prodRes = await fetch(`${API_URL}/menu`);
      const allProducts: Product[] = await prodRes.json();
      setTotalProducts(allProducts.length || 0);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayTransactions = allTransactions.filter((tx: any) => tx.createdAt && tx.createdAt.split('T')[0] === todayStr);

      setTotalRevenue(todayTransactions.reduce((sum: number, tx: any) => sum + (tx.totalPrice || 0), 0));
      setTotalOrders(todayTransactions.length);

      const itemCounts: { [key: string]: number } = {};
      todayTransactions.forEach((tx: any) => {
        if (tx.items && Array.isArray(tx.items)) {
          tx.items.forEach((item: any) => {
            const itemName = item.nama || item.name || 'Unknown';
            itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.quantity || 0);
          });
        }
      });

      const sortedPopular = Object.entries(itemCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([name, quantity]) => {
          const product = allProducts.find((p: Product) => p.nama === name);
          return { name, quantity: quantity as number, image: product?.gambar || '' };
        });
      setPopularMenu(sortedPopular);

      const sortedRecent = [...allTransactions]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);
      setRecentOrders(sortedRecent);

    } catch (error) { setError("Gagal memuat data."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 30000); return () => clearInterval(interval); }, []);

  if (error) return <div className="alert alert-danger">{error}<button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchData}>Coba Lagi</button></div>;

  return (
    <>
      <ContentHeader title="Dashboard" />

      {/* bagian kartu statistik */}
      <section className="row mb-4">
        {[
          { title: "Pendapatan (Hari Ini)", val: formatCurrency(totalRevenue), icon: "bi-wallet2", unit: "" },
          { title: "Transaksi (Hari Ini)", val: totalOrders, icon: "bi-receipt", unit: " Pesanan" },
          { title: "Total Produk", val: totalProducts, icon: "bi-box-seam", unit: " Item" }
        ].map((stat, idx) => (
          <div className="col-12 col-md-6 col-lg-4 mb-4" key={idx}>
            <div className="card stat-card h-100 border-0 shadow-sm" style={{backgroundColor: '#FFFFFF', borderRadius: '16px'}}>
              <div className="card-body d-flex align-items-center p-4">
                {/* ikon lingkaran merah */}
                <div className="icon-circle me-4 shadow-sm flex-shrink-0" style={{ 
                    width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    borderRadius: '50%', fontSize: '24px', backgroundColor: '#E03348', color: '#FFFFFF' 
                }}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <div>
                  <h6 className="card-title text-muted mb-1" style={{ fontSize: '0.9rem' }}>{stat.title}</h6>
                  <h3 className="card-text fw-bolder mb-0 text-dark">
                    {loading ? '...' : stat.val}
                    {stat.unit && <span className="fs-6 fw-normal text-muted ms-1">{stat.unit}</span>}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="row">
        {/* bagian menu populer */}
        <div className="col-12 col-lg-7 mb-4">
          <div className="card list-card h-100 border-0 shadow-sm" style={{backgroundColor: '#FFFFFF', borderRadius: '16px'}}>
            <div className="card-header bg-white border-0 py-4 px-4">
                <h5 className="fw-bold m-0 text-dark">
                    {/* ikon piala merah gelap */}
                    <i className="bi bi-trophy-fill me-2" style={{color: '#C50018'}}></i> Menu Populer (Hari Ini)
                </h5>
            </div>
            <div className="card-body p-0">
              {loading ? <div className="text-center py-5 text-muted">Loading...</div> : (
                <ul className="list-group list-group-flush">
                  {popularMenu.length === 0 ? <li className="list-group-item text-muted text-center py-4 border-0">Belum ada penjualan.</li> : 
                    popularMenu.map((item, index) => (
                      <li key={index} className="list-group-item d-flex align-items-center py-3 px-4 border-bottom-0 hover-bg">
                        
                        {/* nomor urut merah */}
                        <div className="me-3 d-flex align-items-center justify-content-center fw-bold shadow-sm flex-shrink-0" 
                             style={{width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#E03348', color: 'white', fontSize: '0.85rem'}}>
                            {index + 1}
                        </div>

                        {/* gambar produk */}
                        <div className="me-3 flex-shrink-0" style={{width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f0f0f0'}}>
                            {item.image ? (
                                <img src={item.image} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                     onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/50/eee/999?text=IMG'; }} />
                            ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                    <i className="bi bi-image"></i>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow-1" style={{minWidth: 0}}>
                            <span className="fw-bold text-dark d-block mb-0 text-truncate">{item.name}</span>
                            <span className="text-muted small">Terjual</span>
                        </div>
                        
                        {/* lencana latar merah muda */}
                        <span className="badge rounded-pill px-3 py-2 text-dark flex-shrink-0" style={{ backgroundColor: '#FFF5F6', border: '1px solid #E03348' }}>
                            <span style={{fontWeight: '800'}}>{item.quantity}x</span>
                        </span>
                      </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* bagian pesanan terbaru */}
        <div className="col-12 col-lg-5 mb-4">
          <div className="card list-card h-100 border-0 shadow-sm" style={{backgroundColor: '#FFFFFF', borderRadius: '16px'}}>
            <div className="card-header bg-white border-0 py-4 px-4">
                <h5 className="fw-bold m-0 text-dark">
                    {/* ikon jam merah gelap */}
                    <i className="bi bi-clock-history me-2" style={{color: '#C50018'}}></i> Pesanan Terbaru
                </h5>
            </div>
            <div className="card-body p-0">
              {loading ? <div className="text-center py-5 text-muted">Loading...</div> : (
                <ul className="list-group list-group-flush">
                  {recentOrders.length === 0 ? <li className="list-group-item text-muted text-center py-4 border-0">Belum ada transaksi.</li> : 
                    recentOrders.map((tx) => (
                      <li key={tx._id} className="list-group-item d-flex justify-content-between align-items-center py-3 px-4 border-bottom-0 hover-bg">
                        <div style={{minWidth: 0}}>
                          <span className="fw-bold d-block text-dark text-truncate" style={{fontSize: '0.95rem'}}>{formatTransactionId(tx._id)}</span>
                          <small className="text-muted text-truncate d-block" style={{fontSize: '0.75rem'}}>
                            {tx.items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)} Item • {new Date(tx.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                          </small>
                        </div>
                        <span className="fw-bold text-dark flex-shrink-0 ms-2">{formatCurrency(tx.totalPrice)}</span>
                      </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}