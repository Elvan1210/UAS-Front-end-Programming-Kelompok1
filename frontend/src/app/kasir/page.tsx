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

// === IMPORT GAMBAR LANGSUNG (JURUS BUNDLING) ===
import qrisGambar from './qris-kantin.jpg'; 

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  notes?: string; 
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

  const [isOffline, setIsOffline] = useState(false);

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentNotesItemId, setCurrentNotesItemId] = useState<string>('');
  const [tempNotes, setTempNotes] = useState('');

  // === FUNGSI FETCH PRODUCTS ===
  const fetchProducts = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.onLine) {
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
        saveMenusToCache(formattedData);

        const uniqueCategories = ['Semua', ...new Set(formattedData.map(p => p.category))];
        setCategories(uniqueCategories);
        setIsOffline(false);

      } else {
        console.log("📵 OFFLINE: Mengambil produk dari cache...");
        setIsOffline(true);
        const cachedMenus = getMenusFromCache();
        if (cachedMenus && cachedMenus.length > 0) {
          setProducts(cachedMenus);
          const uniqueCategories = ['Semua', ...new Set(cachedMenus.map(p => p.category))];
          setCategories(uniqueCategories);
        } else {
          alert('Anda sedang offline dan data menu belum tersimpan.');
        }
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setIsOffline(true);
      const cachedMenus = getMenusFromCache();
      if (cachedMenus && cachedMenus.length > 0) {
        setProducts(cachedMenus);
        const uniqueCategories = ['Semua', ...new Set(cachedMenus.map(p => p.category))];
        setCategories(uniqueCategories);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleOnline = () => { setIsOffline(false); fetchProducts(); }
    const handleOffline = () => { setIsOffline(true); }

    if (typeof window !== 'undefined' && !navigator.onLine) setIsOffline(true);

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
    if (!productInStock || productInStock.stock === 0) return alert('Stok habis!');
    
    if (existingItem) {
      if (existingItem.quantity < productInStock.stock) {
        setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        alert('Stok tidak cukup!');
      }
    } else {
      setCart([...cart, { ...product, quantity: 1, notes: '' }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existingItem = cart.find(item => item._id === productId);
    if (existingItem) {
      if (existingItem.quantity > 1) {
        setCart(cart.map(item => item._id === productId ? { ...item, quantity: item.quantity - 1 } : item));
      } else {
        setCart(cart.filter(item => item._id !== productId));
      }
    }
  };

  const deleteFromCart = (productId: string) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const openNotesModal = (itemId: string) => {
    const item = cart.find(i => i._id === itemId);
    setCurrentNotesItemId(itemId);
    setTempNotes(item?.notes || '');
    setShowNotesModal(true);
  };

  const saveNotes = () => {
    setCart(cart.map(item => item._id === currentNotesItemId ? { ...item, notes: tempNotes } : item));
    setShowNotesModal(false);
    setTempNotes('');
  };

  const getCartQuantity = (productId: string): number => {
    const item = cart.find(i => i._id === productId);
    return item ? item.quantity : 0;
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

  // === FUNGSI COMPLETE TRANSACTION (UPDATED WITH NOTES) ===
  const completeTransaction = async (method: string) => {
    const cashierName = localStorage.getItem('loggedInUser') || 'Unknown Cashier';
    const paidAmount = (method === 'QRIS') ? totalPrice : (parseFloat(amountPaid) || 0);
    const changeAmount = (method === 'QRIS') ? 0 : change;

    const transactionData = {
      items: cart.map(item => ({
        productId: item._id,
        nama: item.name,
        harga: item.price,
        quantity: item.quantity,
        fotoUrl: item.gambar || '',
        // === KIRIM NOTES KE BACKEND ===
        notes: item.notes || '' 
      })),
      totalPrice: totalPrice,
      paymentAmount: paidAmount,
      changeAmount: changeAmount,
      paymentMethod: method
    };

    if (typeof window !== 'undefined' && navigator.onLine) {
      console.log("🌐 ONLINE: Mengirim transaksi...");
      try {
        const res = await fetch(`${API_URL}/api/transactions`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Gagal menyimpan'); 
        }

        setSuccessData({ method, total: totalPrice, change: changeAmount });
        setShowSuccessModal(true); 
        resetCartAndState();
      } catch (error: any) {
        console.error(error);
        alert(`Error: ${error.message}`);
      }
    } else {
      console.log("📵 OFFLINE: Queue transaksi...");
      const offlinePayload: OfflineTransactionPayload = {
        ...transactionData,
        offlineId: `offline-${Date.now()}`,
        cashierName: cashierName,
        createdAt: new Date().toISOString()
      };
      saveTransactionToQueue(offlinePayload);
      setSuccessData({ method, total: totalPrice, change: changeAmount });
      setShowSuccessModal(true); 
      resetCartAndState();
    }
  };

  const handleProcessPayment = () => {
    if (cart.length === 0) return alert('Keranjang kosong!');
    if (paymentMethod === 'Cash') {
      const paidAmount = parseFloat(amountPaid) || 0;
      if (paidAmount < totalPrice) return alert('Uang kurang!');
      completeTransaction('Cash');
    } else if (paymentMethod === 'QRIS') {
      setQrisImage(qrisGambar.src); 
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
      {isOffline && (
        <div className="alert alert-warning text-center" style={{ position: 'fixed', top: '1rem', left: '300px', right: '2rem', zIndex: 1100 }}>
          <i className="bi bi-wifi-off"></i> <strong>Mode Offline Aktif.</strong>
        </div>
      )}

      <div className="product-pane">
        <header className="content-header" style={{ marginBottom: '1rem', padding: 0 }}>
          <h1>Pilih Menu</h1>
          <input type="text" className="form-control w-50 ms-auto" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </header>

        <div id="category-tabs" className="mb-3">
          {categories.map(category => (
            <button key={category} className={`btn btn-outline-primary me-2 mb-2 category-btn ${currentCategory === category ? 'active' : ''}`} onClick={() => setCurrentCategory(category)}>
              {category}
            </button>
          ))}
        </div>

        <div className="row product-grid" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {filteredProducts.length === 0 ? <p className="text-center text-muted col-12">Produk tidak ditemukan.</p> : filteredProducts.map(product => {
            const qtyInCart = getCartQuantity(product._id);
            return (
              <div key={product._id} className="col-lg-4 col-md-6 col-6 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <img src={product.gambar || 'https://via.placeholder.com/150'} className="card-img-top" style={{ height: '150px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => addToCart(product)} />
                  {qtyInCart > 0 && <span className="badge bg-primary position-absolute" style={{ top: '10px', right: '10px' }}>{qtyInCart}</span>}
                  <div className="card-body p-3 d-flex flex-column">
                    <h5 className="card-title fs-6 fw-bold">{product.name}</h5>
                    <p className="text-primary fw-bold">{formatCurrency(product.price)}</p>
                    <small className="text-muted mb-2">Stok: {product.stock}</small>
                    {qtyInCart === 0 ? (
                      <button className="btn btn-primary btn-sm w-100 mt-auto" onClick={() => addToCart(product)}>Tambah</button>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeFromCart(product._id)}>-</button>
                        <span className="fw-bold">{qtyInCart}</span>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => addToCart(product)} disabled={qtyInCart >= product.stock}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <aside className="cart-pane" style={{ height: 'calc(100vh - 4rem)' }}>
        <h3 className="fw-bold mb-3">Detail Pesanan</h3>
        <ul className="list-group list-group-flush" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {cart.length === 0 ? <li className="list-group-item text-center text-muted">Keranjang kosong</li> : cart.map(item => (
            <li key={item._id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="fw-bold d-block">{item.name}</span>
                  <small className="text-muted">{formatCurrency(item.price)} x {item.quantity}</small>
                  {item.notes && <div className="mt-1 text-info small"><i className="bi bi-sticky"></i> {item.notes}</div>}
                </div>
                <div className="text-end">
                  <strong className="d-block mb-1">{formatCurrency(item.price * item.quantity)}</strong>
                  <button className="btn btn-outline-info btn-sm p-1 me-1 border-0" onClick={() => openNotesModal(item._id)}><i className="bi bi-sticky"></i></button>
                  <button className="btn btn-outline-danger btn-sm p-1 border-0" onClick={() => deleteFromCart(item._id)}><i className="bi bi-trash-fill"></i></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        <div className="cart-summary mt-3">
          <label className="fw-bold">Metode Pembayaran</label>
          <div className="d-flex mb-3 gap-2">
            <button className={`btn w-50 ${paymentMethod === 'Cash' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPaymentMethod('Cash')}>Cash</button>
            <button className={`btn w-50 ${paymentMethod === 'QRIS' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPaymentMethod('QRIS')}>QRIS</button>
          </div>

          {paymentMethod === 'Cash' && (
            <div className="mb-3">
              <input type="number" className="form-control" placeholder="Jumlah Bayar" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
              <div className="d-flex justify-content-between mt-2">
                <span>Kembalian:</span>
                <span className={`fw-bold ${change < 0 ? 'text-danger' : ''}`}>{formatCurrency(change)}</span>
              </div>
            </div>
          )}

          <h5 className="d-flex justify-content-between border-top pt-2">
            <span>Total:</span>
            <span className="text-primary fw-bold">{formatCurrency(totalPrice)}</span>
          </h5>
          <button className="btn btn-primary btn-lg w-100 fw-bold mt-3" onClick={handleProcessPayment}>
            {isOffline ? 'Simpan (Offline)' : 'Proses Pembayaran'}
          </button>
        </div>
      </aside>

      <Modal show={showQrisModal} onHide={() => setShowQrisModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Pembayaran QRIS</Modal.Title></Modal.Header>
        <Modal.Body className="text-center">
          <p>Scan QR di bawah:</p>
          <h3 className="text-primary fw-bold">{formatCurrency(qrisTotal)}</h3>
          {qrisImage && <img src={qrisImage} className="img-fluid my-3" style={{ maxWidth: '100%', maxHeight: '400px' }} />}
          <p className="text-muted small">QR Code Asli Kedai Kakak Beradik Food.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQrisModal(false)}>Batal</Button>
          <Button variant="success" onClick={() => completeTransaction('QRIS')}>Konfirmasi (Manual)</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
        <Modal.Body className="text-center p-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          <h3 className="fw-bold">Berhasil!</h3>
          <p className="text-muted">Transaksi tersimpan.</p>
          <div className="text-start bg-light p-3 rounded">
             <div className="d-flex justify-content-between"><span>Metode:</span><strong>{successData.method}</strong></div>
             <div className="d-flex justify-content-between"><span>Total:</span><strong>{formatCurrency(successData.total)}</strong></div>
             {successData.method === 'Cash' && <div className="d-flex justify-content-between"><span>Kembalian:</span><strong>{formatCurrency(successData.change)}</strong></div>}
          </div>
          <Button className="w-100 mt-3" onClick={handleCloseSuccessModal}>Tutup</Button>
        </Modal.Body>
      </Modal>

      <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Catatan</Modal.Title></Modal.Header>
        <Modal.Body>
          <textarea className="form-control" rows={3} placeholder="Contoh: Pedas, tanpa sayur..." value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotesModal(false)}>Batal</Button>
          <Button variant="primary" onClick={saveNotes}>Simpan</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}