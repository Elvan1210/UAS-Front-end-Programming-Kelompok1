'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from 'react-bootstrap';

// Interface untuk data form
interface ProductForm {
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function InputMenuPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    price: 0,
    stock: 0,
    category: 'Makanan', // Set default kategori
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validasi sederhana
    if (!formData.name || formData.price <= 0) {
      setError('Nama dan harga harus diisi (harga tidak boleh 0)!');
      setLoading(false);
      return;
    }

    try {
      // API call untuk 'POST' (Create)
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Produk berhasil ditambahkan!');
        // Reset form setelah berhasil
        setFormData({ name: '', price: 0, stock: 0, category: 'Makanan' });
        
        // Arahkan ke halaman kelola setelah 1.5 detik
        setTimeout(() => {
          router.push('/menu/kelola');
        }, 1500);
      } else {
        setError('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('❌ Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header as="h4" className="bg-primary text-white">
              ➕ Input Menu Baru
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Pesan Alert untuk Success atau Error */}
                {success && <Alert variant="success">{success}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Form Group untuk Nama Produk */}
                <Form.Group className="mb-3" controlId="formNamaProduk">
                  <Form.Label className="fw-bold">Nama Produk</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Masukkan nama produk"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Form Group untuk Harga */}
                <Form.Group className="mb-3" controlId="formHarga">
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
                    min="0"
                    disabled={loading}
                  />
                </Form.Group>

                {/* Form Group untuk Stock */}
                <Form.Group className="mb-3" controlId="formStock">
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
                    placeholder="Masukkan stock awal"
                    required
                    min="0"
                    disabled={loading}
                  />
                </Form.Group>

                {/* Form Group untuk Kategori */}
                <Form.Group className="mb-3" controlId="formKategori">
                  <Form.Label className="fw-bold">Kategori</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Snack">Snack</option>
                    <option value="Umum">Umum</option>
                  </Form.Select>
                </Form.Group>

                <hr />

                {/* Tombol Submit dan Kembali */}
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        {' '}
                        Menyimpan...
                      </>
                    ) : (
                      '💾 Simpan Produk'
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/menu')} // Kembali ke halaman pilihan
                    disabled={loading}
                  >
                    Kembali ke Pilihan Menu
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}