'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Badge,
  Alert,
  Spinner,
  ListGroup,
  Button,
  Modal, // <-- TAMBAHAN
} from 'react-bootstrap';
import { useRouter } from 'next/navigation'; // <-- TAMBAHAN

// Interface untuk Produk (sama seperti di halaman kelola)
interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

// Interface untuk item di Keranjang
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function KasirPage() {
  const router = useRouter(); // <-- BARU: Untuk pindah halaman
  
  // --- STATE UNTUK DATA PRODUK ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE UNTUK KERANJANG ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // --- STATE BARU UNTUK MODAL CHECKOUT ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0); // Uang yang dibayar
  const [checkoutLoading, setCheckoutLoading] = useState(false); // Loading di modal
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // 1. Ambil data produk saat halaman dimuat
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari server');
      }
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        throw new Error(data.message || 'Gagal memuat produk');
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  // 2. Filter produk berdasarkan pencarian
  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // 3. Logika Keranjang: Tambah produk ke keranjang
  const addToCart = (product: Product) => {
    // Cek stok sebelum menambah ke keranjang
    const itemInCart = cartItems.find(item => item.productId === product._id);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;
    
    if (currentQuantityInCart >= product.stock) {
      alert(`Stok ${product.name} tidak mencukupi (sisa: ${product.stock})`);
      return;
    }

    const existingItem = cartItems.find(
      (item) => item.productId === product._id
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  // 4. Logika Keranjang: Update quantity
  const updateCartQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p._id === productId);
    
    // Cek stok saat update
    if (product && newQuantity > product.stock) {
      alert(`Stok ${product.name} tidak mencukupi (sisa: ${product.stock})`);
      return; // Batalkan update jika melebihi stok
    }

    if (newQuantity <= 0) {
      setCartItems(cartItems.filter((item) => item.productId !== productId));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  // 5. Logika Keranjang: Hitung total harga
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);
  
  // 6. BARU: Hitung kembalian
  const changeAmount = useMemo(() => {
    return amountPaid - totalPrice;
  }, [amountPaid, totalPrice]);


  // 7. DIUBAH: Fungsi ini sekarang HANYA membuka modal
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutError(null);
    setAmountPaid(0); // Reset jumlah bayar
    setShowCheckoutModal(true);
  };

  // 8. BARU: Fungsi untuk menutup modal
  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
  };

  // 9. BARU: Fungsi untuk KONFIRMASI PEMBAYARAN
  const handleConfirmCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    if (changeAmount < 0) {
      setCheckoutError('Uang yang dibayar kurang!');
      setCheckoutLoading(false);
      return;
    }

    try {
      const kasirEmail = localStorage.getItem('kasirUserEmail') || 'Admin';

      // Data ini disesuaikan dengan controller Anda
      const transactionData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity, // <-- PENTING: Sesuai model Anda
        })),
        total: totalPrice,         // Sesuai model Anda
        payment: amountPaid,     // Sesuai model Anda
        change: changeAmount,      // Sesuai model Anda
        cashier: kasirEmail,     // Sesuai model Anda
      };

      // Kirim ke API backend
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Transaksi Berhasil Disimpan!');
        setCartItems([]);           // Kosongkan keranjang
        closeCheckoutModal();       // Tutup modal
        router.push('/transaksi');  // Pindah ke halaman transaksi
      } else {
        // Tampilkan pesan error dari backend (misal: "Stok tidak mencukupi")
        throw new Error(data.message || 'Gagal menyimpan transaksi');
      }
    } catch (err: any) {
      // Menangkap error (termasuk error stok) dan menampilkannya di modal
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };


  return (
    <>
      <style jsx global>{`
        .product-card-hover:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
      `}</style>

      <Container fluid className="mt-4">
        {/* Tampilkan Error di atas jika ada */}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" size="sm" onClick={fetchProducts}>
              Coba Lagi
            </Button>
          </Alert>
        )}

        <Row>
          {/* === KOLOM KIRI: PILIH PRODUK === */}
          <Col md={7}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">📦 Pilih Produk</h5>
              </Card.Header>
              <Card.Body>
                {/* ... (InputGroup, Tampilan Loading, Tampilan Kosong...) ... */}
                {/* SEMUA INI SAMA, TIDAK BERUBAH */}

                <InputGroup className="mb-3">
                  <InputGroup.Text>🔍</InputGroup.Text>
                  <Form.Control
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                {loading && (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Memuat produk...</p>
                  </div>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    {/* ... (SVG icon) ... */}
                    <h5 className="mt-3">Tidak ada produk</h5>
                    <p>
                      {products.length > 0
                        ? 'Tidak ada produk yang cocok.'
                        : 'Input produk di Halaman Menu dulu.'}
                    </p>
                  </div>
                )}
                
                {/* Tampilan Daftar Produk */}
                {!loading && !error && (
                  <Row>
                    {filteredProducts.map((product) => (
                      <Col md={6} lg={4} key={product._id} className="mb-3">
                        <Card
                          className="product-card-hover"
                          onClick={() => addToCart(product)}
                        >
                          <Card.Body>
                            <Card.Title className="h6">
                              {product.name}
                            </Card.Title>
                            <Card.Text className="text-muted mb-2">
                              Rp {product.price.toLocaleString('id-ID')}
                            </Card.Text>
                            <Badge
                              bg={
                                product.stock > 10
                                  ? 'success'
                                  : product.stock > 0
                                  ? 'warning'
                                  : 'danger'
                              }
                            >
                              Stok: {product.stock}
                            </Badge>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* === KOLOM KANAN: KERANJANG === */}
          <Col md={5}>
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">🛒 Keranjang</h5>
              </Card.Header>
              <Card.Body
                style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column' }}
              >
                {/* Tampilan Keranjang Kosong (SAMA) */}
                {cartItems.length === 0 ? (
                  <div className="text-center py-5 text-muted m-auto">
                    {/* ... (SVG icon) ... */}
                    <h5 className="mt-3">Keranjang kosong</h5>
                    <p>Silakan pilih produk di sebelah kiri.</p>
                  </div>
                ) : (
                  // Tampilan Daftar Item di Keranjang (SAMA)
                  <>
                    <ListGroup variant="flush" style={{ flexGrow: 1 }}>
                      {cartItems.map((item) => (
                        <ListGroup.Item
                          key={item.productId}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            <small className="text-muted">
                              Rp {item.price.toLocaleString('id-ID')}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateCartQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                            >
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateCartQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    {/* Total dan Tombol Bayar */}
                    <div className="mt-auto pt-3 border-top">
                      <h4 className="d-flex justify-content-between">
                        <span>Total:</span>
                        <span className="fw-bold">
                          Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                      </h4>
                      <Button
                        variant="success"
                        className="w-100 mt-3"
                        onClick={handleCheckout} // <-- FUNGSI INI DIUBAH
                        disabled={cartItems.length === 0}
                      >
                        Bayar Sekarang
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* === MODAL CHECKOUT BARU === */}
      <Modal show={showCheckoutModal} onHide={closeCheckoutModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Pembayaran</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {checkoutError && <Alert variant="danger">{checkoutError}</Alert>}
          
          <h3 className="text-center mb-3">
            Total Belanja
            <br />
            <span className="fw-bold text-primary">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </h3>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Jumlah Bayar (Rp)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Masukkan jumlah uang"
              value={amountPaid || ''}
              onChange={(e) => setAmountPaid(parseInt(e.target.value) || 0)}
              autoFocus
            />
          </Form.Group>

          <h4 className="text-center">
            Kembalian
            <br />
            <span
              className={`fw-bold ${
                changeAmount < 0 ? 'text-danger' : 'text-success'
              }`}
            >
              Rp {changeAmount.toLocaleString('id-ID')}
            </span>
          </h4>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeCheckoutModal}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmCheckout}
            disabled={checkoutLoading || changeAmount < 0}
          >
            {checkoutLoading ? (
              <Spinner as="span" size="sm" />
            ) : (
              'Konfirmasi & Simpan'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}