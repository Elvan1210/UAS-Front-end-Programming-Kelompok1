"use client";

import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

// definisi tipe data transaksi
interface Transaction {
  _id: string; createdAt: string; totalPrice: number; paymentMethod: string;
  paymentAmount?: number; changeAmount?: number;
  items: { productId: string; nama: string; harga: number; quantity: number; notes?: string; fotoUrl?: string; }[];
}

interface Product { _id: string; nama: string; gambar: string; }

// fungsi bantuan format
const formatCurrency = (number: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const formatTime = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' });
const formatTransactionId = (id: string) => `TRX${id.slice(-5).toUpperCase()}`;

const ContentHeader = ({ title }: { title: string }) => (
  <header className="mb-4">
    <h1 style={{fontSize: '2rem', fontWeight: 800, color: '#131313'}}>{title}</h1>
    <div style={{width: '60px', height: '5px', background: '#7B68EE', borderRadius: '4px'}}></div>
  </header>
);

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [currentCashierName, setCurrentCashierName] = useState('Admin');

  // inisialisasi nama kasir
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        if (storedUser.startsWith('{')) {
            const parsed = JSON.parse(storedUser);
            const name = parsed.email.split('@')[0];
            setCurrentCashierName(name.charAt(0).toUpperCase() + name.slice(1));
        } else {
            const name = storedUser.split('@')[0];
            setCurrentCashierName(name.charAt(0).toUpperCase() + name.slice(1));
        }
    }
  }, []);

  // ambil data produk
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/menu`);
      const data = await res.json();
      setProducts(data);
    } catch (error) { console.error(error); }
  };

  // ambil data transaksi
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transactions`);
      const transactionResponse = await res.json();
      const data: Transaction[] = transactionResponse.success ? transactionResponse.data : [];
      const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(sortedData);
      setFilteredTransactions(sortedData);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); fetchTransactions(); }, []);

  // logika filter tanggal
  useEffect(() => {
    if (!dateFilter) setFilteredTransactions(transactions);
    else setFilteredTransactions(transactions.filter(tx => tx.createdAt && tx.createdAt.startsWith(dateFilter)));
  }, [dateFilter, transactions]);

  const getProductImage = (item: any) => {
    if (item.fotoUrl && item.fotoUrl !== "") return item.fotoUrl;
    const liveProduct = products.find(p => p._id === item.productId || p.nama === item.nama);
    return liveProduct?.gambar || 'https://via.placeholder.com/50';
  };

  const handleShowDetail = (tx: Transaction) => { setSelectedTx(tx); setShowDetailModal(true); };

  return (
    <>
      <ContentHeader title="Histori Transaksi" />

      {/* kartu filter tanggal */}
      <div className="card border-0 mb-4 p-3 shadow-sm d-flex flex-row align-items-center gap-3" style={{borderRadius: '16px'}}>
         <div className="d-flex align-items-center gap-2 text-muted">
            <i className="bi bi-funnel-fill" style={{color: '#7B68EE'}}></i>
            <span className="fw-bold d-none d-md-inline">Filter Tanggal:</span>
         </div>
          <input type="date" className="form-control border-0 bg-light fw-bold" style={{maxWidth: '200px', color: '#555'}} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
      </div>

      {/* tampilan tabel untuk desktop */}
      <div className="card border-0 shadow-lg d-none d-md-block" style={{borderRadius: '20px', overflow: 'hidden'}}>
        <div className="p-4 d-flex justify-content-between align-items-center" style={{background: 'linear-gradient(135deg, #7B68EE 0%, #6C5CE7 100%)', color: 'white'}}>
            <h5 className="m-0 fw-bold"><i className="bi bi-receipt me-2"></i> Daftar Transaksi</h5>
            <span className="badge bg-white text-primary rounded-pill px-3 py-2" style={{color: '#7B68EE !important'}}>{filteredTransactions.length} Data</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr style={{fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888'}}>
                 <th className="py-3 ps-4 border-bottom">ID</th>
                <th className="py-3 border-bottom">Waktu</th>
                <th className="py-3 border-bottom">Total</th>
                <th className="py-3 border-bottom">Metode</th>
                <th className="py-3 border-bottom">Ringkasan Item</th>
                <th className="py-3 pe-4 border-bottom text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-5 text-muted">Memuat data...</td></tr> : 
               filteredTransactions.length === 0 ? <tr><td colSpan={6} className="text-center py-5 text-muted">Tidak ada data.</td></tr> : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} style={{cursor: 'pointer', transition: 'background 0.2s'}}>
                    <td className="ps-4 py-3 fw-bold" style={{color: '#333'}}>
                        <div className="d-flex align-items-center gap-2">
                            <div style={{width:'8px', height:'8px', borderRadius:'50%', background: '#7B68EE'}}></div>
                            {formatTransactionId(tx._id)}
                        </div>
                     </td>
                    <td className="text-muted small">
                        <div>{formatDate(tx.createdAt)}</div>
                        <div style={{fontSize: '0.8rem'}}>{formatTime(tx.createdAt)}</div>
                    </td>
                     <td><span className="fw-bold" style={{color: '#131313'}}>{formatCurrency(tx.totalPrice)}</span></td>
                    <td>
                      <span className="badge rounded-pill px-3 py-2" style={{
                            backgroundColor: tx.paymentMethod === 'Cash' ? '#E8F5E9' : '#E3F2FD',
                            color: tx.paymentMethod === 'Cash' ? '#2E7D32' : '#1565C0',
                            fontWeight: 600
                        }}>
                        {tx.paymentMethod}
                       </span>
                    </td>
                    <td>
                       <div className="d-flex align-items-center">
                          {tx.items.slice(0, 3).map((item, idx) => (
                               <img key={idx} src={getProductImage(item)} className="rounded-circle border border-white shadow-sm" style={{width: '32px', height: '32px', objectFit: 'cover', marginLeft: idx > 0 ? '-10px' : '0'}} />
                          ))}
                          {tx.items.length > 3 && <span className="ms-1 small text-muted">+{tx.items.length - 3}</span>}
                          <span className="ms-2 small text-muted">({tx.items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                       </div>
                    </td>
                     <td className="pe-4 text-end">
                      <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold" style={{color: '#7B68EE', border: '1px solid #eee'}} onClick={() => handleShowDetail(tx)}>Lihat Struk</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* tampilan kartu untuk mobile */}
      <div className="d-md-none pb-5">
        {loading ? (
           <div className="text-center py-5 text-muted">Memuat data...</div>
        ) : filteredTransactions.length === 0 ? (
           <div className="text-center py-5 text-muted">Tidak ada data transaksi.</div>
        ) : (
           <div className="d-flex flex-column gap-3">
             {filteredTransactions.map((tx) => (
               <div key={tx._id} className="card border-0 shadow-sm p-3" style={{borderRadius: '16px', backgroundColor: '#fff'}}>
                 {/* header kartu */}
                 <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <div style={{width:'8px', height:'8px', borderRadius:'50%', background: '#7B68EE'}}></div>
                        <span className="fw-bold text-dark">{formatTransactionId(tx._id)}</span>
                    </div>
                    <small className="text-muted" style={{fontSize: '0.75rem'}}>
                        {formatDate(tx.createdAt)} • {formatTime(tx.createdAt)}
                    </small>
                  </div>
                 
                 {/* info utama */}
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <div className="text-muted small" style={{fontSize: '0.7rem', textTransform: 'uppercase'}}>Total Belanja</div>
                        <span className="fw-bold text-dark fs-4">{formatCurrency(tx.totalPrice)}</span>
                    </div>
                    <span className="badge rounded-pill px-3 py-2" style={{
                            backgroundColor: tx.paymentMethod === 'Cash' ? '#E8F5E9' : '#E3F2FD',
                            color: tx.paymentMethod === 'Cash' ? '#2E7D32' : '#1565C0',
                            fontWeight: 600
                        }}>
                        {tx.paymentMethod}
                    </span>
                 </div>

                 {/* item preview mobile */}
                 <div className="d-flex align-items-center mb-3 bg-light p-2 rounded-3">
                    <div className="d-flex align-items-center">
                        {tx.items.slice(0, 3).map((item, idx) => (
                            <img key={idx} src={getProductImage(item)} className="rounded-circle border border-white shadow-sm" style={{width: '28px', height: '28px', objectFit: 'cover', marginLeft: idx > 0 ? '-8px' : '0'}} />
                        ))}
                     </div>
                    <small className="text-muted ms-2" style={{fontSize: '0.8rem'}}>
                        {tx.items.reduce((a, b) => a + b.quantity, 0)} pcs ({tx.items.length} jenis)
                    </small>
                 </div>

                 <button className="btn w-100 fw-bold py-2" 
                    style={{backgroundColor: '#F3F0FF', color: '#7B68EE', borderRadius: '12px', border: '1px solid #E0D4FC'}}
                    onClick={() => handleShowDetail(tx)}>
                     <i className="bi bi-receipt me-2"></i> Lihat Struk
                 </button>
               </div>
             ))}
           </div>
        )}
      </div>

      {/* modal struk belanja */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="sm"> 
        <Modal.Body className="p-0" style={{backgroundColor: '#e0e0e0'}}> 
          {selectedTx && (
            <div style={{
                backgroundColor: '#fff',
                margin: '10px auto',
                padding: '25px',
                width: '100%',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                fontFamily: "'Courier New', Courier, monospace", 
                color: '#333',
                position: 'relative'
               }}>
                <div className="text-center mb-4">
                    <h5 className="fw-bold mb-1" style={{letterSpacing: '-0.5px'}}>KANTIN RAJAWALI</h5>
                    <p style={{fontSize: '0.8rem', margin: 0}}>Jl. Rajawali No. 123, Tangerang</p>
                    <p style={{fontSize: '0.8rem', margin: 0}}>Telp: 0812-3456-7890</p>
                </div>

                <div className="mb-3 pb-3 border-bottom border-dark border-1" style={{borderStyle: 'dashed !important'}}>
                    <div className="d-flex justify-content-between" style={{fontSize: '0.8rem'}}>
                        <span>Tgl: {formatDate(selectedTx.createdAt)}</span>
                        <span>Jam: {formatTime(selectedTx.createdAt)}</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{fontSize: '0.8rem'}}>
                         <span>ID: {formatTransactionId(selectedTx._id)}</span>
                        <span>Kasir: {currentCashierName}</span>
                    </div>
                </div>

                <div className="mb-3 pb-3 border-bottom border-dark border-1" style={{borderStyle: 'dashed !important'}}>
                    {selectedTx.items.map((item, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="fw-bold" style={{fontSize: '0.9rem'}}>{item.nama}</div>
                             <div className="d-flex justify-content-between" style={{fontSize: '0.85rem'}}>
                                <span>{item.quantity} x {formatCurrency(item.harga)}</span>
                                <span>{formatCurrency(item.harga * item.quantity)}</span>
                             </div>
                            {item.notes && <div className="fst-italic small text-muted">Cat: {item.notes}</div>}
                        </div>
                    ))}
                </div>

                <div className="mb-4">
                    <div className="d-flex justify-content-between fw-bold mb-1" style={{fontSize: '1rem'}}>
                        <span>TOTAL</span>
                        <span>{formatCurrency(selectedTx.totalPrice)}</span>
                     </div>
                    <div className="d-flex justify-content-between mb-1" style={{fontSize: '0.9rem'}}>
                        <span>Bayar ({selectedTx.paymentMethod})</span>
                        <span>{formatCurrency(selectedTx.paymentAmount || selectedTx.totalPrice)}</span> 
                    </div>
                    <div className="d-flex justify-content-between" style={{fontSize: '0.9rem'}}>
                        <span>Kembali</span>
                        <span>{formatCurrency(selectedTx.changeAmount || 0)}</span>
                     </div>
                </div>

                <div className="text-center pt-3 border-top border-dark border-1" style={{borderStyle: 'dashed !important'}}>
                    <p className="mb-1 fw-bold">TERIMA KASIH</p>
                    <p className="small mb-0">Silakan datang kembali</p>
                </div>

                <div style={{
                    position: 'absolute', bottom: '-5px', left: 0, width: '100%', height: '10px',
                    background: 'radial-gradient(circle, transparent 50%, #e0e0e0 50%)',
                     backgroundSize: '10px 10px', transform: 'rotate(180deg)'
                }}></div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0" style={{backgroundColor: '#e0e0e0'}}>
            <Button variant="dark" size="sm" onClick={() => window.print()} className="me-2 rounded-0"><i className="bi bi-printer-fill me-1"></i> Cetak</Button>
            <Button variant="outline-dark" size="sm" onClick={() => setShowDetailModal(false)} className="rounded-0">Tutup</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}