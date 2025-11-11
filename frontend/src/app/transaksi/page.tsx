"use client";

import { useState, useEffect } from "react";
// 1. IMPORT Modal & Button dari React Bootstrap
import { Modal, Button } from "react-bootstrap";

const API_URL = 'http://localhost:5000/api';

// Interface Transaksi
interface Transaction {
  _id: string;
  createdAt: string;
  totalPrice: number;
  paymentMethod: string; // <-- Bisa jadi 'null' atau 'undefined' dari DB
  items: {
    productId: string;
    nama: string;
    harga: number;
    quantity: number;
  }[];
}

// Interface Produk
interface Product {
  _id: string;
  nama: string;
  gambar: string;
}

// Fungsi formatCurrency
const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// Fungsi formatDate
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Fungsi formatTransactionId
const formatTransactionId = (id: string) => {
  return `TRX${id.slice(-5).toUpperCase()}`;
};

// Komponen ContentHeader
const ContentHeader = ({ title }: { title: string }) => {
  return (
    <header className="content-header">
      <h1>{title}</h1>
    </header>
  );
};

// Komponen Utama Halaman
export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Fungsi fetchProducts
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/menu');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
    }
  };

  // Fungsi fetchTransactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transactions`);
      const transactionResponse = await res.json();

      if (!transactionResponse.success) {
        throw new Error(transactionResponse.message || 'Gagal mengambil data');
      }

      const data: Transaction[] = transactionResponse.data || [];
      const sortedData = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTransactions(sortedData);
      setFilteredTransactions(sortedData);
    } catch (error) {
      console.error("Gagal mengambil transaksi:", error);
    }
    setLoading(false);
  };

  // useEffect untuk fetch data awal
  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  // useEffect untuk filter tanggal
  useEffect(() => {
    if (!dateFilter) {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter(tx => tx.createdAt && tx.createdAt.startsWith(dateFilter))
      );
    }
  }, [dateFilter, transactions]);

  // Fungsi getProductImage
  const getProductImage = (productId: string, productName: string) => {
    const product = products.find(p => p._id === productId || p.nama === productName);
    return product?.gambar || 'https://via.placeholder.com/50';
  };

  // Fungsi untuk buka/tutup modal
  const handleShowDetail = (tx: Transaction) => {
    setSelectedTx(tx);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedTx(null);
  };

  // Render komponen
  return (
    <>
      <ContentHeader title="Histori Transaksi" />

      <div className="row mb-4">
        <div className="col-md-4">
          <label htmlFor="filter-tanggal" className="form-label fw-bold">Filter per Tanggal</label>
          <input
            type="date"
            className="form-control"
            id="filter-tanggal"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="content-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle content-table">
            <thead className="table-light">
              <tr>
                <th>ID Transaksi</th>
                <th>Waktu</th>
                <th>Total Belanja</th>
                <th>Metode Bayar</th>
                <th>Item</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4">Memuat data...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-muted">Tidak ada transaksi.</td></tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="fw-bold">{formatTransactionId(tx._id)}</td>
                    <td>{formatDate(tx.createdAt)}</td>
                    <td className="fw-bold text-success">{formatCurrency(tx.totalPrice)}</td>
                    <td>
                      {/* <-- PERBAIKAN DI TABEL --> */}
                      <span className={`badge ${
                        tx.paymentMethod === 'Cash' ? 'bg-success' : 
                        tx.paymentMethod === 'QRIS' ? 'bg-info' : 'bg-secondary'
                      }`}>
                        {tx.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-2" style={{ minWidth: '300px' }}>
                        {tx.items.map((item, idx) => (
                          <div key={idx} className="d-flex align-items-center gap-2">
                            <img 
                              src={getProductImage(item.productId, item.nama)} 
                              alt={item.nama}
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                objectFit: 'cover', 
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0'
                              }}
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/40';
                              }}
                            />
                            <span className="flex-grow-1">
                              {item.nama} 
                              <small className="text-muted"> (x{item.quantity})</small>
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn btn-info btn-sm"
                        onClick={() => handleShowDetail(tx)} 
                      >
                        <i className="bi bi-eye-fill"></i> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Transaksi */}
      <Modal show={showDetailModal} onHide={handleCloseDetail} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedTx ? `Detail ${formatTransactionId(selectedTx._id)}` : 'Detail Transaksi'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedTx && (
            <div>
              {/* Bagian 1: Info Utama */}
              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <span className="text-muted d-block">Total Belanja:</span>
                  <span className="fs-5 fw-bold text-success">{formatCurrency(selectedTx.totalPrice)}</span>
                </div>
                <div className="col-md-6 mb-3">
                  <span className="text-muted d-block">Metode Bayar:</span>
                  {/* <-- PERBAIKAN DI MODAL (INI YANG ANDA LAPORKAN) --> */}
                  <span className={`badge fs-6 ${
                    selectedTx.paymentMethod === 'Cash' ? 'bg-success' : 
                    selectedTx.paymentMethod === 'QRIS' ? 'bg-info' : 'bg-secondary'
                  }`}>
                    {selectedTx.paymentMethod || 'N/A'}
                  </span>
                </div>
                <div className="col-md-12 mb-2">
                  <span className="text-muted d-block">Waktu Transaksi:</span>
                  <span className="fw-bold">{formatDate(selectedTx.createdAt)}</span>
                </div>
              </div>

              {/* Bagian 2: List Item */}
              <hr className="my-3" />
              <h5 className="mb-3 fw-bold">Item yang Dibeli ({selectedTx.items.length})</h5>
              
              <ul className="list-group list-group-flush">
                {selectedTx.items.map((item, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                    <div className="d-flex align-items-center">
                      <img 
                        src={getProductImage(item.productId, item.nama)} 
                        alt={item.nama}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px' }}
                      />
                      <div>
                        <span className="fw-bold d-block">{item.nama}</span>
                        <small className="text-muted">{formatCurrency(item.harga)} x {item.quantity}</small>
                      </div>
                    </div>
                    <strong className="text-dark fs-6">{formatCurrency(item.harga * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseDetail} className="fw-bold">
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}