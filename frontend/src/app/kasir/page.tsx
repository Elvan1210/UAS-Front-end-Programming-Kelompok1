"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  gambar: string; // 1. Menggunakan 'gambar' agar konsisten
}
interface CartItem extends Product {
  quantity: number;
}
interface TransactionItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
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

  const [qrisModal, setQrisModal] = useState<any>(null);
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [qrisTotal, setQrisTotal] = useState(0);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const bootstrap = require("bootstrap/dist/js/bootstrap.bundle.min.js");
      const modalEl = document.getElementById('qrisModal');
      if (modalEl) {
        setQrisModal(new bootstrap.Modal(modalEl));
      }
    }
  }, []);

  const fetchProducts = async () => {
    try {
      // 1. GANTI /products menjadi /menu
      const res = await fetch(`${API_URL}/menu`); 
      const productResponse = await res.json();

      // 2. TAMBAHKAN MAPPING INI (PENTING!)
      // Data dari /menu perlu di-format agar sesuai dgn interface Product
      const formattedData: Product[] = productResponse.map((p: any) => ({
        _id: p._id,
        name: p.nama, // 'nama' dari backend
        price: parseFloat(p.harga) || 0, // 'harga' (string) diubah jadi number
        stock: p.stock || 0,
        category: p.category || 'Makanan',
        gambar: p.gambar // 'gambar' dari backend (URL Cloudinary)
      }));

      setProducts(formattedData); // 3. Gunakan data yang sudah diformat


      const uniqueCategories = ['Semua', ...new Set(formattedData.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
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
    // Ini baris 114 yang error, _id sudah dihapus:
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


  const completeTransaction = async (method: string) => {
    
    const cashierName = localStorage.getItem('loggedInUser') || 'Unknown Cashier';
    const paidAmount = (method === 'QRIS') ? totalPrice : (parseFloat(amountPaid) || 0);
    const changeAmount = (method === 'QRIS') ? 0 : change;

    const transactionData = {
      // 1. Sesuaikan format 'items' dengan OrderItemSchema
      items: cart.map(item => ({
        productId: item._id, 
        nama: item.name,      // 'name' diubah menjadi 'nama'
        harga: item.price,    // 'price' diubah menjadi 'harga'
        quantity: item.quantity
        // 'subtotal' dihapus karena tidak ada di schema
      })),
      
      // 2. Sesuaikan nama field top-level dengan orderController
      totalPrice: totalPrice,       // 'total' diubah menjadi 'totalPrice'
      paymentAmount: paidAmount,  // 'payment' diubah menjadi 'paymentAmount'
      changeAmount: changeAmount,   // 'change' diubah menjadi 'changeAmount'
      
      // 3. Tambahkan paymentMethod (diminta oleh backend)
      paymentMethod: method
      
      // 'cashier' dihapus karena tidak ada di schema
    };

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

      alert(`Pembayaran ${method} berhasil!`);
      setCart([]);
      setAmountPaid('');
      setPaymentMethod('Cash');
      
      if (qrisModal) qrisModal.hide();
      
      fetchProducts();

    } catch (error: any) {
      console.error(error);
      alert(`Terjadi kesalahan: ${error.message}`);
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
      if (qrisModal) qrisModal.show();
    }
  };

  const filteredProducts = products.filter(p => 
    p.stock > 0 &&
    (currentCategory === 'Semua' || p.category === currentCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  return (
    <div className="pos-container cashier-container" style={{ padding: '2rem' }}>
      
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
                    // GANTI BARIS INI:
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
      
      {/* Kolom Keranjang (Kanan) */}
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
              <i className="bi bi-check-circle-fill"></i> Proses Pembayaran
            </button>
          </div>
        </div>
      </aside>

      {/* Modal QRIS */}
      <div className="modal fade" id="qrisModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Pembayaran QRIS</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body text-center">
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
            </div>
            <div className="modal-footer d-grid">
              <button 
                type="button" 
                className="btn btn-success" 
                id="btn-confirm-qris"
                onClick={() => completeTransaction('QRIS')}
              >
                <i className="bi bi-check-circle-fill"></i> Konfirmasi Pembayaran (Simulasi)
              </button>
              <button type="button" className="btn btn-secondary mt-2" data-bs-dismiss="modal">Batal</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}