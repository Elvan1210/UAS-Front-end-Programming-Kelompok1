'use client';

// Ini adalah kode yang Anda berikan tadi,
// sekarang ditempatkan di /menu/kelola/page.tsx

import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Table,
  Modal,
  Spinner,
} from 'react-bootstrap';

interface Product {
  _id?: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  isActive?: boolean;
}

export default function KelolaMenuPage() { // Nama fungsi bisa diganti
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    name: '',
    price: 0,
    stock: 0,
    category: 'Umum',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Pastikan URL ini benar (sesuai Gambar 4, backend di port 5000)
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0) {
      alert('Nama dan harga harus diisi!');
      return;
    }

    try {
      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : 'http://localhost:5000/api/products';

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          editingProduct
            ? '✅ Produk berhasil diupdate!'
            : '✅ Produk berhasil ditambahkan!'
        );
        closeModal();
        fetchProducts();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${id}`,
        {
          method: 'DELETE',
        }
      );
      const data = await response.json();

      if (data.success) {
        alert('✅ Produk berhasil dihapus!');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Gagal menghapus produk');
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: 0, stock: 0, category: 'Umum' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', price: 0, stock: 0, category: 'Umum' });
  };

  return (
    <>
      <Container className="mt-4">
        <Card>
          <Card.Header className="bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">📦 Daftar Produk</h4>
              <Button variant="light" onClick={() => openModal()}>
                ➕ Tambah Produk
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Memuat data...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '50px' }}>No</th>
                      <th>Nama Produk</th>
                      <th>Harga</th>
                      <th>Stock</th>
                      <th>Kategori</th>
                      <th style={{ width: '150px' }} className="text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-5 text-muted"
                        >
                          <h3>📦</h3>
                          <p>Belum ada produk</p>
                        </td>
                      </tr>
                    ) : (
                      products.map((product, index) => (
                        <tr key={product._id}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{product.name}</strong>
                          </td>
                          <td>Rp {product.price.toLocaleString('id-ID')}</td>
                          <td>
                            <Badge
                              bg={
                                product.stock > 10
                                  ? 'success'
                                  : product.stock > 0
                                  ? 'warning'
                                  : 'danger'
                              }
                            >
                              {product.stock}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="info">{product.category}</Badge>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => openModal(product)}
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                product._id && handleDelete(product._id)
                              }
                            >
                              🗑️ Hapus
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modal Form */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nama Produk</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Masukkan nama produk"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Harga (Rp)</Form.Label>
              <Form.Control
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Masukkan harga"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Stock</Form.Label>
              <Form.Control
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Masukkan stock"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Kategori</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="Makanan">Makanan</option>
                <option value="Minuman">Minuman</option>
                <option value="Snack">Snack</option>
                <option value="Umum">Umum</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              ❌ Batal
            </Button>
            <Button variant="primary" type="submit">
              💾 Simpan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}