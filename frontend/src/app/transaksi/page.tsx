// app/transaksi/page.tsx (VERSI PERBAIKAN LENGKAP)
"use client";

import { useState, useEffect } from "react";

const API_URL = 'http://localhost:5000/api';

interface Transaction {
  _id: string;
  createdAt: string;
  totalPrice: number;
  paymentMethod: string;
  items: {
    productId: string;
    nama: string;
    harga: number;
    quantity: number;
  }[];
}

interface Product {
  _id: string;
  nama: string;
  gambar: string;
}

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
    second: '2-digit',
    hour12: false
  });
};

const formatTransactionId = (id: string) => {
  return `TRX${id.slice(-5).toUpperCase()}`;
};

const ContentHeader = ({ title }: { title: string }) => {
  return (
    <header className="content-header">
      <h1>{title}</h1>
    </header>
  );
};

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  // Fetch products untuk mendapatkan gambar
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/menu');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
    }
  };

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

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (!dateFilter) {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter(tx => tx.createdAt && tx.createdAt.startsWith(dateFilter))
      );
    }
  }, [dateFilter, transactions]);

  const getProductImage = (productId: string, productName: string) => {
    const product = products.find(p => p._id === productId || p.nama === productName);
    return product?.gambar || 'https://via.placeholder.com/50';
  };

  const showDetail = (tx: Transaction) => {
    const itemsDetail = tx.items.map(item =>
      `\n- ${item.nama} (x${item.quantity}) - ${formatCurrency(item.harga * item.quantity)}`
    ).join('');

    alert(
      `--- Detail Transaksi ${formatTransactionId(tx._id)} ---` +
      `\nTotal: ${formatCurrency(tx.totalPrice)}` +
      `\nWaktu: ${formatDate(tx.createdAt)}` +
      `\nMetode Bayar: ${tx.paymentMethod || 'N/A'}` +
      `\n\nItem dibeli:${itemsDetail}`
    );
  };

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
                      <span className={`badge ${tx.paymentMethod === 'Cash' ? 'bg-success' : 'bg-info'}`}>
                        {tx.paymentMethod}
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
                        onClick={() => showDetail(tx)}
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
    </>
  );
}