'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  ButtonGroup,
  Modal,
  ListGroup,
} from 'react-bootstrap';

// 1. Interface untuk Product (hasil populate)
interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

// 2. Perbaikan Interface untuk Transaksi
interface Transaction {
  _id: string;
  items: {
    productId: Product | null; // <-- DIPERBAIKI: jadi Objek Product (atau null)
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    _id: string;
  }[];
  total: number;
  payment: number;
  change: number;
  cashier: string;
  transactionDate: string;
  createdAt: string;
}

type FilterPeriod = 'all' | 'day' | 'week' | 'month';

export default function TransaksiPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterPeriod>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
    
  // --- TAMBAHAN: State untuk loading hapus ---
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // 1. Ambil data saat halaman dimuat
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Panggil API (sesuai route: getAllTransactions)
      const response = await fetch('http://localhost:5000/api/transactions');
      const data = await response.json();
      if (data.success) {
        setAllTransactions(data.data);
      } else {
        throw new Error(data.message || 'Gagal memuat transaksi');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- TAMBAHAN: Fungsi untuk Hapus Transaksi ---
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Yakin ingin menghapus transaksi ini? Stok produk terkait akan dikembalikan.'
      )
    ) {
      return;
    }

    setIsDeleting(id); // Set loading untuk tombol spesifik
    try {
      const response = await fetch(
        `http://localhost:5000/api/transactions/${id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Transaksi berhasil dihapus!');
        // Update state di frontend tanpa perlu reload
        setAllTransactions((prevTransactions) =>
          prevTransactions.filter((tx) => tx._id !== id)
        );
      } else {
        throw new Error(data.message || 'Gagal menghapus transaksi');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsDeleting(null); // Selesai loading
    }
  };
  // ========================================

  // 2. Logika Filter (Sudah ada)
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    switch (filter) {
      case 'day':
        return allTransactions.filter(
          (tx) => new Date(tx.transactionDate) >= today
        );
      case 'week':
        return allTransactions.filter(
          (tx) => new Date(tx.transactionDate) >= startOfWeek
        );
      case 'month':
        return allTransactions.filter(
          (tx) => new Date(tx.transactionDate) >= startOfMonth
        );
      case 'all':
      default:
        return allTransactions;
    }
  }, [allTransactions, filter]);

  // 3. Logika Summary Cards (Sudah ada)
  const summaryData = useMemo(() => {
    const totalPenjualan = filteredTransactions.reduce(
      (acc, tx) => acc + tx.total,
      0
    );
    const totalTransaksi = filteredTransactions.length;
    const totalItemTerjual = filteredTransactions.reduce(
      (acc, tx) =>
        acc + tx.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0),
      0
    );
    return { totalPenjualan, totalTransaksi, totalItemTerjual };
  }, [filteredTransactions]);

  // ... (Fungsi formatRupiah & formatTanggal tetap sama)
  const formatRupiah = (angka: number) => {
    return `Rp ${angka.toLocaleString('id-ID')}`;
  };
  const formatTanggal = (isoDate: string) => {
    return new Date(isoDate).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ... (Fungsi openDetail tetap sama)
  const openDetail = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setShowDetailModal(true);
  };

  return (
    <Container fluid className="mt-4">
      {/* === 1. SUMMARY CARDS === */}
      {/* ... (Kode Summary Cards Anda tetap sama) ... */}
      <Row>
        <Col md={4} className="mb-3">
          <Card bg="primary" text="white" className="shadow-sm">
            <Card.Body>
              <Row>
                <Col>
                  <Card.Title>Total Penjualan</Card.Title>
                  <h3>{formatRupiah(summaryData.totalPenjualan)}</h3>
                </Col>
                <Col xs="auto" className="d-flex align-items-center">
                  <span style={{ fontSize: '2.5rem' }}>💰</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card bg="success" text="white" className="shadow-sm">
            <Card.Body>
              <Row>
                <Col>
                  <Card.Title>Total Transaksi</Card.Title>
                  <h3>{summaryData.totalTransaksi}</h3>
                </Col>
                <Col xs="auto" className="d-flex align-items-center">
                  <span style={{ fontSize: '2.5rem' }}>🧾</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card bg="info" text="white" className="shadow-sm">
            <Card.Body>
              <Row>
                <Col>
                  <Card.Title>Total Item Terjual</Card.Title>
                  <h3>{summaryData.totalItemTerjual}</h3>
                </Col>
                <Col xs="auto" className="d-flex align-items-center">
                  <span style={{ fontSize: '2.5rem' }}>📦</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === 2. FILTER & TABEL === */}
      <Row className="mt-3">
        <Col>
          <Card className="shadow-sm">
            {/* ... (Header Card & Tombol Filter tetap sama) ... */}
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Daftar Transaksi</h5>
              <ButtonGroup>
                <Button
                  variant={filter === 'day' ? 'primary' : 'outline-light'}
                  onClick={() => setFilter('day')}
                >
                  Hari Ini
                </Button>
                <Button
                  variant={filter === 'week' ? 'primary' : 'outline-light'}
                  onClick={() => setFilter('week')}
                >
                  Minggu Ini
                </Button>
                <Button
                  variant={filter === 'month' ? 'primary' : 'outline-light'}
                  onClick={() => setFilter('month')}
                >
                  Bulan Ini
                </Button>
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline-light'}
                  onClick={() => setFilter('all')}
                >
                  Semua
                </Button>
              </ButtonGroup>
            </Card.Header>
            <Card.Body>
              {/* ... (Logika Loading & Error tetap sama) ... */}
              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Memuat data...</p>
                </div>
              )}
              {error && <Alert variant="danger">{error}</Alert>}

              {!loading && !error && (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th>No</th>
                        <th>Tanggal & Waktu</th>
                        <th>Kasir</th>
                        <th>Total</th>
                        <th>Bayar</th>
                        <th>Kembali</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* ... (Logika Tbody 'kosong' tetap sama) ... */}
                      {filteredTransactions.length === 0 ? (
                         <tr>
                          <td
                            colSpan={7}
                            className="text-center text-muted py-5"
                          >
                            Tidak ada data transaksi untuk periode ini.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx, index) => (
                          <tr key={tx._id}>
                            <td>{index + 1}</td>
                            <td>{formatTanggal(tx.transactionDate)}</td>
                            <td>
                              <Badge bg="secondary">{tx.cashier}</Badge>
                            </td>
                            <td className="fw-bold">
                              {formatRupiah(tx.total)}
                            </td>
                            <td>{formatRupiah(tx.payment)}</td>
                            <td className="text-success">
                              {formatRupiah(tx.change)}
                            </td>
                            
                            {/* === PERUBAHAN DI SINI === */}
                            <td className="text-center">
                              {isDeleting === tx._id ? (
                                <Spinner animation="border" size="sm" variant="danger" />
                              ) : (
                                <>
                                  <Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => openDetail(tx)}
                                    className="me-2"
                                  >
                                    Detail
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(tx._id)}
                                  >
                                    Hapus
                                  </Button>
                                </>
                              )}
                            </td>
                            {/* ======================= */}
                            
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* === MODAL DETAIL TRANSAKSI === */}
      {/* ... (Kode Modal Detail Anda tetap sama, sudah benar) ... */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detail Transaksi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <>
              <p>
                <strong>ID Transaksi:</strong> {selectedTransaction._id}
              </p>
              <p>
                <strong>Waktu:</strong> {formatTanggal(selectedTransaction.transactionDate)}
              </p>
              <p>
                <strong>Kasir:</strong> {selectedTransaction.cashier}
              </p>

              <h5 className="mt-4">Daftar Item</h5>
              <ListGroup>
                {selectedTransaction.items.map((item) => (
                  <ListGroup.Item
                    key={item._id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      {/* Cek jika produk masih ada */}
                      <span className="fw-bold">{item.productId ? item.productId.name : item.name}</span>
                      <br />
                      <small className="text-muted">
                        {item.quantity} x {formatRupiah(item.price)}
                      </small>
                    </div>
                    <span className="fw-bold">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <hr />
              <Row className="mt-3">
                <Col>
                  <ListGroup>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Total Belanja:</strong>
                      <strong className="text-primary">{formatRupiah(selectedTransaction.total)}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Uang Tunai:</span>
                      <span>{formatRupiah(selectedTransaction.payment)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Kembalian:</strong>
                      <strong className="text-success">{formatRupiah(selectedTransaction.change)}</strong>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}