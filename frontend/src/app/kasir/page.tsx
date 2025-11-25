"use client";

// impor library yang dibutuhkan
import { useEffect, useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { saveMenusToCache, getMenusFromCache, saveTransactionToQueue } from '@/lib/offlineStorage';
import qrisGambar from './qris-kantin.jpg'; 

// konfigurasi url api
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PRIMARY_BLUE = '#1C46F5';

// definisi tipe data produk dan keranjang
interface Product { _id: string; name: string; price: number; stock: number; category: string; gambar: string; }
interface CartItem extends Product { quantity: number; notes?: string; }

// fungsi format mata uang rupiah
const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// komponen utama halaman kasir
export default function KasirPage() {
  // state untuk data produk dan kategori
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [currentCategory, setCurrentCategory] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  
  // state untuk keranjang belanja
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);

  // state untuk modal qris
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [qrisTotal, setQrisTotal] = useState(0);
  
  // state untuk modal sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ method: '', total: 0, change: 0 });

  // state untuk modal error
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // state untuk mode offline dan catatan
  const [isOffline, setIsOffline] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentNotesItemId, setCurrentNotesItemId] = useState<string>('');
  const [tempNotes, setTempNotes] = useState('');

  const [showMobileCart, setShowMobileCart] = useState(false);

  // fungsi menampilkan pesan error
  const showError = (msg: string) => {
    setErrorMessage(msg);
    setErrorModal(true);
  };

  // fungsi mengambil data produk dari server
  const fetchProducts = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.onLine) {
        const res = await fetch(`${API_URL}/menu`);
        if (!res.ok) throw new Error('Gagal fetch');
        const productResponse = await res.json();
        
        // format data produk
        const formattedData: Product[] = productResponse.map((p: any) => ({
          _id: p._id, name: p.nama, price: parseFloat(p.harga) || 0, stock: p.stock || 0, category: p.category || 'Makanan', gambar: p.gambar
        }));
        setProducts(formattedData);
        saveMenusToCache(formattedData);
        setCategories(['Semua', ...new Set(formattedData.map(p => p.category))]);
        setIsOffline(false);
      } else {
        setIsOffline(true);
        // ambil data dari cache jika offline
        const cached = getMenusFromCache();
        if (cached && cached.length > 0) {
          setProducts(cached);
          setCategories(['Semua', ...new Set(cached.map(p => p.category))]);
        }
      }
    } catch (error) { setIsOffline(true); }
  };

  // efek samping untuk inisialisasi data
  useEffect(() => {
    fetchProducts();
    window.addEventListener('online', () => { setIsOffline(false); fetchProducts(); });
    window.addEventListener('offline', () => setIsOffline(true));
  }, []);

  // hitung total harga setiap kali keranjang berubah
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
    setChange((parseFloat(amountPaid) || 0) - total);
  }, [cart, amountPaid]);

  // fungsi menambah produk ke keranjang
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item._id === product._id);
    const inStock = products.find(p => p._id === product._id);
    
    if (!inStock || inStock.stock === 0) return showError('Stok produk ini sudah habis!');
    if (existing) {
      if (existing.quantity < inStock.stock) setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
      else showError('Stok tidak mencukupi untuk menambah lagi!');
    } else {
      setCart([...cart, { ...product, quantity: 1, notes: '' }]);
    }
  };

  // fungsi menghapus produk dari keranjang
  const removeFromCart = (id: string) => {
    const existing = cart.find(item => item._id === id);
    if (existing) {
      if (existing.quantity > 1) setCart(cart.map(item => item._id === id ? { ...item, quantity: item.quantity - 1 } : item));
      else setCart(cart.filter(item => item._id !== id));
    }
  };

  // fungsi membuka modal catatan
  const openNotesModal = (id: string) => {
    setCurrentNotesItemId(id);
    setTempNotes(cart.find(i => i._id === id)?.notes || '');
    setShowNotesModal(true);
  };

  // fungsi menyimpan catatan pesanan
  const saveNotes = () => {
    setCart(cart.map(item => item._id === currentNotesItemId ? { ...item, notes: tempNotes } : item));
    setShowNotesModal(false);
  };

  // fungsi reset status aplikasi
  const resetCartAndState = () => { 
      setCart([]); 
      setAmountPaid(''); 
      setPaymentMethod('Cash'); 
      setShowQrisModal(false);
      setShowMobileCart(false); 
  };

  // fungsi menyelesaikan transaksi
  const completeTransaction = async (method: string) => {
    const transactionData = {
      items: cart.map(item => ({ productId: item._id, nama: item.name, harga: item.price, quantity: item.quantity, fotoUrl: item.gambar || '', notes: item.notes || '' })),
      totalPrice: totalPrice,
      paymentAmount: (method === 'QRIS') ? totalPrice : (parseFloat(amountPaid) || 0),
      changeAmount: (method === 'QRIS') ? 0 : change,
      paymentMethod: method
    };

    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_URL}/api/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transactionData) });
        if (!res.ok) throw new Error('Gagal');
        setSuccessData({ method, total: totalPrice, change: (method === 'QRIS') ? 0 : change });
        setShowSuccessModal(true);
        resetCartAndState();
      } catch (err:any) { showError(err.message); }
    } else {
      // simpan ke antrian jika offline
      saveTransactionToQueue({ ...transactionData, offlineId: `offline-${Date.now()}`, cashierName: 'Offline', createdAt: new Date().toISOString() });
      setSuccessData({ method, total: totalPrice, change: (method === 'QRIS') ? 0 : change });
      setShowSuccessModal(true);
      resetCartAndState();
    }
  };

  // fungsi memproses pembayaran
  const handleProcessPayment = () => {
    if (cart.length === 0) return showError('Keranjang masih kosong. Pilih menu dulu ya!');
    if (paymentMethod === 'Cash') {
      if ((parseFloat(amountPaid) || 0) < totalPrice) return showError('Uang yang dimasukkan kurang!');
      completeTransaction('Cash');
    } else {
      setQrisImage(qrisGambar.src); 
      setQrisTotal(totalPrice); 
      setShowQrisModal(true);
    }
  };

  const filteredProducts = products.filter(p => p.stock > 0 && (currentCategory === 'Semua' || p.category === currentCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // render tampilan utama
  return (
    <div className="d-flex flex-column flex-lg-row bg-white" style={{ height: '100vh', overflow: 'hidden' }}> 
      {isOffline && <div className="alert alert-warning fixed-top text-center" style={{zIndex: 1100, left: '0', right: '0'}}>Mode Offline</div>}

      {/* area menu sebelah kiri */}
      <div className={`flex-grow-1 flex-column h-100 position-relative bg-white ${showMobileCart ? 'd-none d-lg-flex' : 'd-flex'}`} style={{ minWidth: '0' }}> 
        
        {/* bagian header menu */}
        <div className="px-3 px-lg-4 pt-3 pt-lg-4 pb-2 bg-white" style={{ zIndex: 10, flexShrink: 0 }}>
            <header className="d-flex flex-column flex-md-row justify-content-between mb-3 align-items-md-end gap-2">
              <div>
                  <h2 className="m-0 text-dark" style={{fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-1px', color: '#131313'}}>Pilih Menu</h2>
                  <div className="mt-2" style={{width: '60px', height: '5px', background: PRIMARY_BLUE, borderRadius: '4px'}}></div>
              </div>
              
              <input 
                type="text" 
                className="form-control" 
                style={{maxWidth: '100%', width: '250px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #ddd'}}
                placeholder="Cari menu..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </header>

            <div className="d-flex gap-2 pb-2" style={{overflowX: 'auto', whiteSpace: 'nowrap'}}>
              {categories.map(cat => (
                <button key={cat} 
                  className="btn fw-bold px-3 py-1"
                  style={{
                    backgroundColor: currentCategory === cat ? PRIMARY_BLUE : '#fff', 
                    color: currentCategory === cat ? '#fff' : PRIMARY_BLUE,
                    border: `1px solid ${PRIMARY_BLUE}`,
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setCurrentCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
        </div>

        {/* area daftar produk */}
        <div className="flex-grow-1 overflow-auto px-3 px-lg-4 pb-5 pt-2">
            <div className="row g-2 g-md-3"> 
              {filteredProducts.map(product => {
                const qty = cart.find(i => i._id === product._id)?.quantity || 0;
                return (
                  <div key={product._id} className="col-6 col-md-4 col-lg-4 col-xl-3">
                    <div className="card h-100 border-0 shadow-sm" 
                         style={{borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s', backgroundColor: '#fff'}}
                    >
                      <div style={{height: '130px', overflow: 'hidden', position: 'relative'}}> 
                        <img src={product.gambar || 'https://via.placeholder.com/150'} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-white text-center small py-1" style={{fontSize: '0.7rem', backdropFilter: 'blur(2px)'}}>
                            Stok: {product.stock}
                        </div>
                      </div>

                      <div className="card-body p-2 p-md-3 d-flex flex-column">
                        <h6 className="fw-bold text-dark mb-1 text-truncate" style={{fontSize: '0.95rem'}}>{product.name}</h6>
                        <div className="fw-bolder mb-3" style={{fontSize: '1rem', color: PRIMARY_BLUE}}>{formatCurrency(product.price)}</div>
                        
                        <div className="mt-auto">
                            {qty === 0 ? (
                                <button className="btn w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 btn-sm" 
                                        style={{backgroundColor: PRIMARY_BLUE, color: 'white', borderRadius: '12px', transition: 'all 0.2s'}}
                                        onClick={() => addToCart(product)}>
                                    <i className="bi bi-cart-plus-fill"></i> <span className="d-none d-sm-inline">Tambah</span>
                                </button>
                            ) : (
                                <div className="d-flex justify-content-between align-items-center px-1 py-1" 
                                     style={{backgroundColor: PRIMARY_BLUE, borderRadius: '12px', color: 'white', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'}}>
                                     <button className="btn btn-link text-white text-decoration-none p-0 d-flex align-items-center justify-content-center" 
                                             style={{width: '30px', height: '30px'}}
                                             onClick={() => removeFromCart(product._id)}>
                                         <i className="bi bi-dash-lg fw-bold"></i>
                                     </button>
                                     <span className="fw-bold" style={{fontSize: '1rem'}}>{qty}</span>
                                     <button className="btn btn-link text-white text-decoration-none p-0 d-flex align-items-center justify-content-center" 
                                             style={{width: '30px', height: '30px'}}
                                             onClick={() => addToCart(product)} disabled={qty >= product.stock}>
                                        <i className="bi bi-plus-lg fw-bold"></i>
                                     </button>
                                </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="d-block d-lg-none" style={{ height: '80px' }}></div>
            <div className="d-none d-lg-block" style={{ height: '20px' }}></div>
        </div>

        {/* tombol mengambang untuk mobile */}
        {!showMobileCart && cart.length > 0 && (
           <div className="d-lg-none position-fixed bottom-0 start-0 w-100 p-3" style={{zIndex: 1030}}> 
              <button 
                  className="btn w-100 text-white fw-bold py-3 rounded-4 shadow-lg d-flex justify-content-between align-items-center px-4"
                  style={{backgroundColor: PRIMARY_BLUE}}
                  onClick={() => setShowMobileCart(true)}
              >
                  <div className="d-flex align-items-center gap-2">
                     <div className="bg-white rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                          style={{width: 24, height: 24, fontSize: '0.8rem', color: PRIMARY_BLUE}}>
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                     </div>
                     <span>Lihat Pesanan</span>
                  </div>
                  <span>{formatCurrency(totalPrice)}</span>
              </button>
           </div>
        )}
      </div>
      
      <div className="d-none d-lg-block" style={{width: '1px', backgroundColor: '#e0e0e0'}}></div>

      {/* bagian kanan detail pesanan */}
      <aside 
          className={`d-flex flex-column bg-white shadow-lg ${showMobileCart ? 'd-flex fixed-top w-100 h-100' : 'd-none d-lg-flex'}`} 
          style={{ 
             width: showMobileCart ? '100%' : '480px', 
             height: '100vh', 
             zIndex: 1040, 
             flexShrink: 0 
          }}
      >
        <div className="p-3 px-lg-4 border-bottom bg-white d-flex justify-content-between align-items-center">
            <div>
                <h5 className="fw-bold m-0 text-dark">Detail Pesanan</h5>
                <small className="text-muted">{cart.length === 0 ? 'Keranjang kosong' : `${cart.reduce((a, b) => a + b.quantity, 0)} Item dipilih`}</small>
            </div>
            <button className="btn btn-light rounded-circle d-lg-none" onClick={() => setShowMobileCart(false)}>
                <i className="bi bi-chevron-down text-dark"></i>
            </button>
        </div>

        <div className="flex-grow-1 overflow-auto px-3 px-lg-4 pb-2 pt-3">
            {cart.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {cart.map(item => (
                <div key={item._id} className="d-flex gap-3 align-items-center border-bottom pb-2">
                   <img src={item.gambar || 'https://via.placeholder.com/50'} style={{width:'55px', height:'55px', borderRadius:'8px', objectFit:'cover'}} />
                   <div className="flex-grow-1">
                      <div className="fw-bold text-dark mb-0" style={{fontSize: '0.9rem'}}>{item.name}</div>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                          <small className="text-muted" style={{fontSize: '0.8rem'}}>{item.quantity} x {formatCurrency(item.price)}</small>
                          <span className="fw-bold text-dark" style={{fontSize: '0.9rem'}}>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                      {item.notes && <div className="small text-info fst-italic mt-1" style={{fontSize: '0.75rem'}}>Cat: {item.notes}</div>}
                   </div>
                   <div className="d-flex flex-column">
                      <button className="btn btn-sm text-secondary p-0 mb-1" onClick={() => openNotesModal(item._id)}><i className="bi bi-pencil-square"></i></button>
                      <button className="btn btn-sm text-danger p-0" onClick={() => removeFromCart(item._id)}><i className="bi bi-x-circle-fill"></i></button>
                   </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <i className="bi bi-cart-x fs-1 mb-2"></i>
                <p>Belum ada pesanan</p>
                <button className="btn btn-sm btn-outline-primary d-lg-none mt-3" onClick={() => setShowMobileCart(false)}>Tambah Menu</button>
             </div>
          )}
        </div>

        <div className="px-4 pt-4 pb-5 bg-white mt-auto border-top shadow-sm">
           <label className="fw-bold mb-2 text-dark" style={{fontSize: '0.85rem'}}>Metode Pembayaran</label>
           <div className="d-flex mb-3"> 
              <button className={`btn btn-sm flex-fill me-2 rounded-2 ${paymentMethod === 'Cash' ? 'text-white' : 'text-secondary border'}`} 
                      style={{backgroundColor: paymentMethod === 'Cash' ? PRIMARY_BLUE : 'transparent', height: '35px', borderColor: PRIMARY_BLUE, color: paymentMethod !== 'Cash' ? PRIMARY_BLUE : 'white'}}
                      onClick={() => setPaymentMethod('Cash')}>Cash</button>
              <button className={`btn btn-sm flex-fill rounded-2 ${paymentMethod === 'QRIS' ? 'text-white' : 'text-secondary border'}`} 
                      style={{backgroundColor: paymentMethod === 'QRIS' ? PRIMARY_BLUE : 'transparent', height: '35px', borderColor: PRIMARY_BLUE, color: paymentMethod !== 'QRIS' ? PRIMARY_BLUE : 'white'}}
                      onClick={() => setPaymentMethod('QRIS')}>QRIS</button>
           </div>
           
           {paymentMethod === 'Cash' && (
             <div className="mb-3">
                <input type="number" className="form-control form-control-sm" placeholder="Masukkan jumlah uang..." value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
             </div>
           )}

           <div className="mb-3">
               <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Kembalian:</span>
                  <span className={`fw-bold small ${change < 0 ? 'text-danger' : 'text-dark'}`}>{formatCurrency(change)}</span>
               </div>
               <div className="d-flex justify-content-between align-items-center border-top pt-2">
                  <span className="fw-bold text-dark fs-5">Total:</span>
                  <span className="fw-bold fs-4" style={{color: PRIMARY_BLUE}}>{formatCurrency(totalPrice)}</span>
               </div>
           </div>
           
           <button className="btn w-100 text-white fw-bold py-2 rounded-2 shadow-sm" 
               style={{backgroundColor: PRIMARY_BLUE, fontSize: '1rem'}} 
               onClick={handleProcessPayment}
            >
               {isOffline ? 'Simpan Offline' : 'Proses Pembayaran'}
           </button>
        </div>
      </aside>

      {/* modal error */}
      <Modal show={errorModal} onHide={() => setErrorModal(false)} centered size="sm">
        <Modal.Body className="text-center p-4">
            <div className="mb-3 d-inline-flex align-items-center justify-content-center" 
                 style={{width: '60px', height: '60px', backgroundColor: '#FEF2F2', borderRadius: '50%', color: '#DC2626'}}>
                <i className="bi bi-exclamation-circle-fill" style={{fontSize: '2rem'}}></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">Perhatian!</h5>
            <p className="text-muted mb-4 small">{errorMessage}</p>
            <Button variant="danger" className="w-100 rounded-3 fw-bold" onClick={() => setErrorModal(false)}>
              Mengerti
            </Button>
        </Modal.Body>
      </Modal>

      {/* modal qris */}
      <Modal show={showQrisModal} onHide={() => setShowQrisModal(false)} centered>
        <Modal.Body className="text-center p-4">
          <h5 className="fw-bold mb-3">Scan QRIS</h5>
          {qrisImage && <img src={qrisImage} className="img-fluid mb-3 rounded-3 border" style={{maxHeight: 250}} />}
          <h3 className="fw-bold mb-3" style={{color: PRIMARY_BLUE}}>{formatCurrency(qrisTotal)}</h3>
          <Button style={{backgroundColor: PRIMARY_BLUE, border: 'none'}} className="w-100 fw-bold" onClick={() => completeTransaction('QRIS')}>Konfirmasi Lunas</Button>
        </Modal.Body>
      </Modal>

      {/* modal sukses */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered size="sm">
        <Modal.Body className="text-center p-4">
           <div className="mb-2" style={{fontSize: '3rem', color: PRIMARY_BLUE}}><i className="bi bi-check-circle-fill"></i></div>
           <h5 className="fw-bold mb-1">Berhasil!</h5>
           <p className="text-muted small mb-3">Transaksi disimpan.</p>
           <div className="bg-light p-2 rounded small text-start mb-3">
                <div className="d-flex justify-content-between"><span>Total</span><span className="fw-bold">{formatCurrency(successData.total)}</span></div>
                {successData.method === 'Cash' && <div className="d-flex justify-content-between"><span>Kembali</span><span className="fw-bold text-success">{formatCurrency(successData.change)}</span></div>}
           </div>
           <Button className="w-100 btn-sm" variant="outline-dark" onClick={handleCloseSuccessModal}>Tutup</Button>
        </Modal.Body>
      </Modal>

      {/* modal catatan */}
      <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 py-2"><Modal.Title className="fs-6 fw-bold">Catatan</Modal.Title></Modal.Header>
        <Modal.Body className="py-0"><textarea className="form-control form-control-sm bg-light" rows={3} value={tempNotes} onChange={e => setTempNotes(e.target.value)} /></Modal.Body>
        <Modal.Footer className="border-0 pt-2"><Button style={{backgroundColor: PRIMARY_BLUE, border: 'none'}} size="sm" className="w-100 fw-bold" onClick={saveNotes}>Simpan</Button></Modal.Footer>
      </Modal>
    </div>
  );
  
  // fungsi menutup modal sukses dan refresh produk
  function handleCloseSuccessModal() { setShowSuccessModal(false); fetchProducts(); }
}