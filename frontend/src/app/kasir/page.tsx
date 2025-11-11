// frontend/src/app/kasir/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Modal, Button } from 'react-bootstrap';

// === IMPORT LOGIKA OFFLINE ===
import { 
  saveMenusToCache, 
  getMenusFromCache, 
  saveTransactionToQueue,
  type OfflineTransactionPayload
} from '@/lib/offlineStorage';

const API_URL = "http://localhost:5000";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  gambar: string;
}
interface CartItem extends Product {
  quantity: number;
}

const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [currentCategory, setCurrentCategory] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);

  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [qrisTotal, setQrisTotal] = useState(0);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ 
    method: '', 
    total: 0, 
    change: 0 
  });

  // === STATE OFFLINE ===
  const [isOffline, setIsOffline] = useState(false);

  // === FUNGSI FETCH PRODUCTS (WITH OFFLINE FALLBACK) ===
  const fetchProducts = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.onLine) {
        // --- ONLINE MODE ---
        console.log("🌐 ONLINE: Mengambil produk dari server...");
        const res = await fetch(`${API_URL}/menu`); 
        if (!res.ok) throw new Error('Gagal fetch dari server');
        const productResponse = await res.json();
        const formattedData: Product[] = productResponse.map((p: any) => ({
          _id: p._id,
          name: p.nama, 
          price: parseFloat(p.harga) || 0,
          stock: p.stock || 0,
          category: p.category || 'Makanan',
          gambar: p.gambar
        }));

        setProducts(formattedData);
        saveMenusToCache(formattedData); // Cache untuk offline

        const uniqueCategories = ['Semua', ...new Set(formattedData.map(p => p.category))];
        setCategories(uniqueCategories);
        setIsOffline(false);

      } else {
        // --- OFFLINE MODE ---
        console.log("📵 OFFLINE: Mengambil produk dari cache...");
        setIsOffline(true);
        const cachedMenus = getMenusFromCache();
        if (cachedMenus && cachedMenus.length > 0) {
          setProducts(cachedMenus);
          const uniqueCategories = ['Semua', ...new Set(cachedMenus.map(p => p.category))];
          setCategories(uniqueCategories);
        } else {
          console.warn("⚠️ OFFLINE: Cache menu kosong.");
          alert('Anda sedang offline dan data menu belum tersimpan. Harap online setidaknya sekali untuk mengambil data menu.');
        }
      }
    } catch (error) {
      // --- FALLBACK JIKA FETCH GAGAL ---
      console.error("❌ Gagal mengambil produk, mencoba fallback ke cache:", error);
      setIsOffline(true);
      const cachedMenus = getMenusFromCache();
      if (cachedMenus && cachedMenus.length > 0) {
        console.log("💾 FALLBACK: Mengambil produk dari cache...");
        setProducts(cachedMenus);
        const uniqueCategories = ['Semua', ...new Set(cachedMenus.map(p => p.category))];
        setCategories(uniqueCategories);
      } else {
        console.error("❌ FALLBACK: Cache menu kosong.");
        alert('Gagal mengambil data menu. Silakan cek koneksi internet Anda.');
      }
    }
  };

  // === EFFECT: LOAD PRODUCTS & LISTEN TO NETWORK ===
  useEffect(() => {
    fetchProducts();

    const handleOnline = () => {
      console.log('🌐 KasirPage: Kembali Online');
      setIsOffline(false);
      fetchProducts(); 
    }
    const handleOffline = () => {
      console.log('📵 KasirPage: Koneksi Terputus');
      setIsOffline(true);
    }

    if (typeof window !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); 

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
    calculateChange(total, amountPaid);
  }, [cart, amountPaid]);

  const calculateChange = (total: number, paid: string) => {
    const paidAmount = parseFloat(paid) || 0;
    const newChange = paidAmount - total;
    setChange(newChange);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item._id === product._id);
    const productInStock = products.find(p => p._id === product._id);
    if (!productInStock || productInStock.stock === 0) {
      alert('Stok produk habis!');
      return;
    }
    if (existingItem) {
      if (existingItem.quantity < productInStock.stock) {
        setCart(cart.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        alert('Stok produk tidak mencukupi!');
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existingItem = cart.find(item => item._id === productId);
    if (existingItem) {
      if (existingItem.quantity > 1) {
        setCart(cart.map(item => 
          item._id === productId ? { ...item, quantity: item.quantity - 1 } : item
        ));
      } else {
        setCart(cart.filter(item => item._id !== productId));
      }
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    fetchProducts();
  };

  const resetCartAndState = () => {
    setCart([]);
    setAmountPaid('');
    setPaymentMethod('Cash');
    setShowQrisModal(false); 
  };

  // === FUNGSI COMPLETE TRANSACTION (WITH OFFLINE SUPPORT) ===
  const completeTransaction = async (method: string) => {
    const cashierName = localStorage.getItem('loggedInUser') || 'Unknown Cashier';
    const paidAmount = (method === 'QRIS') ? totalPrice : (parseFloat(amountPaid) || 0);
    const changeAmount = (method === 'QRIS') ? 0 : change;

    const transactionData = {
      items: cart.map(item => ({
        productId: item._id, 
        nama: item.name,
        harga: item.price,
        quantity: item.quantity
      })),
      totalPrice: totalPrice,
      paymentAmount: paidAmount,
      changeAmount: changeAmount,
      paymentMethod: method
    };

    // === CEK: ONLINE ATAU OFFLINE? ===
    if (typeof window !== 'undefined' && navigator.onLine) {
      // --- ONLINE MODE: KIRIM KE SERVER ---
      console.log("🌐 ONLINE: Mengirim transaksi ke server...");
      try {
        const res = await fetch(`${API_URL}/api/transactions`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Gagal menyimpan transaksi'); 
        }

        setSuccessData({
          method: method,
          total: totalPrice,
          change: changeAmount
        });
        setShowSuccessModal(true); 
        
        resetCartAndState();

      } catch (error: any) {
        console.error(error);
        alert(`Terjadi kesalahan: ${error.message}`);
      }
    } else {
      // --- OFFLINE MODE: SIMPAN KE QUEUE ---
      console.log("📵 OFFLINE: Menyimpan transaksi ke antrean...");

      const offlinePayload: OfflineTransactionPayload = {
        ...transactionData,
        offlineId: `offline-${Date.now()}`,
        cashierName: cashierName,
        createdAt: new Date().toISOString()
      };

      saveTransactionToQueue(offlinePayload);

      setSuccessData({
        method: method,
        total: totalPrice,
        change: changeAmount
      });
      setShowSuccessModal(true); 

      resetCartAndState();
    }
  };

  const handleProcessPayment = () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    if (paymentMethod === 'Cash') {
      const paidAmount = parseFloat(amountPaid) || 0;
      if (paidAmount < totalPrice) {
        alert('Jumlah bayar kurang!');
        return;
      }
      completeTransaction('Cash');

    } else if (paymentMethod === 'QRIS') {
      const qrData = `SIMULASI_BAYAR_KE_KANTIN_SEBESAR_${totalPrice}`;
      setQrisImage(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`);
      setQrisTotal(totalPrice);
      
      setShowQrisModal(true);
    }
  };

  const filteredProducts = products.filter(p => 
    p.stock > 0 &&
    (currentCategory === 'Semua' || p.category === currentCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="pos-container cashier-container" style={{ padding: '2rem' }}>
      
      {/* === INDIKATOR OFFLINE === */}
      {isOffline && (
        <div 
          className="alert alert-warning text-center" 
          role="alert"
          style={{ 
            position: 'fixed', 
            top: '1rem', 
            left: 'calc(var(--sidebar-width, 280px) + 2rem)', 
            right: '2rem',
            zIndex: 1100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <i className="bi bi-wifi-off"></i> <strong>Mode Offline Aktif.</strong> Transaksi akan disimpan dan disinkronisasi saat kembali online.
        </div>
      )}

      {/* Kolom Kiri - Product Pane */}
      <div className="product-pane">
        <header className="content-header" style={{ marginBottom: '1rem', padding: 0 }}>
          <h1>Pilih Menu</h1>
          <div className="header-actions">
            <input 
              type="text" 
              className="form-control" 
              id="search-product" 
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div id="category-tabs" className="mb-3">
          {categories.map(category => (
            <button 
              key={category} 
              className={`btn btn-outline-primary me-2 mb-2 category-btn ${currentCategory === category ? 'active' : ''}`}
              onClick={() => setCurrentCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="row product-grid" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {filteredProducts.length === 0 ? (
            <p className="text-center text-muted col-12">Produk tidak ditemukan.</p>
          ) : (
            filteredProducts.map(product => (
              <div key={product._id} className="col-lg-4 col-md-6 col-sm-6 col-6 mb-4" onClick={() => addToCart(product)}>
                <div className="card h-100 product-item shadow-sm border-0">
                  <img 
                    src={product.gambar || 'https://via.placeholder.com/150'} 
                    className="card-img-top"
                    alt={product.name} 
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column p-3">
                    <h5 className="card-title fs-6 fw-bold mb-1">{product.name}</h5>
                    <p className="card-text fw-bold text-primary mb-2">{formatCurrency(product.price)}</p>
                    <small className="text-muted mt-auto">Stok: {product.stock}</small>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Kolom Kanan - Cart Pane */}
      <aside className="cart-pane" style={{ height: 'calc(100vh - 4rem)' }}>
        <h3 className="fw-bold mb-3">Detail Pesanan</h3>
        
        <ul className="list-group list-group-flush" id="cart-items">
          {cart.length === 0 ? (
            <li className="list-group-item text-center text-muted">Keranjang kosong</li>
          ) : (
            cart.map(item => (
              <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-bold d-block">{item.name}</span>
                  <small className="text-muted">{formatCurrency(item.price)} x {item.quantity}</small>
                </div>
                <div>
                  <strong className="me-3">{formatCurrency(item.price * item.quantity)}</strong>
                  <button 
                    className="btn btn-outline-danger btn-sm p-1 border-0" 
                    onClick={() => removeFromCart(item._id)}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        
        <div className="cart-summary">
          <label className="form-label fw-bold">Metode Pembayaran</label>
          <div id="payment-method-options" className="d-flex mb-3">
            <input 
              type="radio" 
              className="btn-check" 
              name="paymentMethod" 
              id="payment-cash" 
              value="Cash" 
              checked={paymentMethod === 'Cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label className="btn btn-outline-primary w-50 me-2" htmlFor="payment-cash">
              <i className="bi bi-cash-coin"></i> Cash
            </label>
            <input 
              type="radio" 
              className="btn-check" 
              name="paymentMethod" 
              id="payment-qris" 
              value="QRIS"
              checked={paymentMethod === 'QRIS'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <label className="btn btn-outline-primary w-50" htmlFor="payment-qris">
              <i className="bi bi-qr-code"></i> QRIS
            </label>
          </div>

          {paymentMethod === 'Cash' && (
            <div id="cash-payment-details">
              <div className="form-floating mb-3">
                <input 
                  type="number" 
                  className="form-control" 
                  id="amount-paid" 
                  placeholder="Masukkan jumlah uang"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
                <label htmlFor="amount-paid">Jumlah Bayar (Rp)</label>
              </div>
              <h5 className="d-flex justify-content-between">
                <span>Kembalian:</span>
                <span id="change" className={`fw-bold ${change < 0 ? 'text-danger' : ''}`}>
                  {change < 0 ? `(Kurang) ${formatCurrency(change)}` : formatCurrency(change)}
                </span>
              </h5>
            </div>
          )}

          <hr />
          <h5 className="d-flex justify-content-between">
            <span>Total:</span>
            <span id="total-price" className="fw-bold text-primary">{formatCurrency(totalPrice)}</span>
          </h5>
          <div className="d-grid mt-3">
            <button 
              className="btn btn-primary btn-lg fw-bold" 
              id="btn-process-payment"
              onClick={handleProcessPayment}
            >
              <i className="bi bi-check-circle-fill"></i> 
              {isOffline ? ' Simpan Transaksi (Offline)' : ' Proses Pembayaran'}
            </button>
          </div>
        </div>
      </aside>

      {/* Modal QRIS */}
      <Modal show={showQrisModal} onHide={() => setShowQrisModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pembayaran QRIS</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Silakan scan QR code di bawah ini untuk membayar:</p>
          <h3 className="fw-bold text-primary">{formatCurrency(qrisTotal)}</h3>
          
          {qrisImage && (
            <img 
              src={qrisImage} 
              id="qris-image" 
              className="img-fluid my-3" 
              alt="QRIS Code" 
              style={{ width: '250px', height: '250px' }} 
            />
          )}
          
          <p className="text-muted small">Ini adalah simulasi. QR code ini tidak terhubung dengan pembayaran nyata.</p>
        </Modal.Body>
        <Modal.Footer className="d-grid">
          <Button 
            variant="success"
            id="btn-confirm-qris"
            onClick={() => completeTransaction('QRIS')}
          >
            <i className="bi bi-check-circle-fill"></i> Konfirmasi Pembayaran (Simulasi)
          </Button>
          <Button variant="secondary" onClick={() => setShowQrisModal(false)} className="mt-2">
            Batal
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sukses */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
        <Modal.Body className="text-center p-4">
          <i 
            className="bi bi-check-circle-fill text-success" 
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
          ></i>
          <h3 className="fw-bold">Pembayaran Berhasil!</h3>
          <p className="text-muted">Pembayaran Anda telah berhasil diproses.</p>
          
          <hr className="my-3" />
          
          <div className="text-start" style={{ fontSize: '0.9rem' }}>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Metode Bayar:</span>
              <span className="fw-bold">{successData.method}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Total Bayar:</span>
              <span className="fw-bold">{formatCurrency(successData.total)}</span>
            </div>
            {successData.method === 'Cash' && (
              <div className="d-flex justify-content-between">
                <span className="text-muted">Kembalian:</span>
                <span className="fw-bold">{formatCurrency(successData.change)}</span>
              </div>
            )}
          </div>

          <Button 
            variant="primary" 
            onClick={handleCloseSuccessModal} 
            className="w-100 mt-4 fw-bold"
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>

    </div>
  );
}