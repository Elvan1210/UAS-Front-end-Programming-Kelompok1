'use client';

import Link from 'next/link';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default function MenuManagementPage() {
  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h2 className="mb-3">Manajemen Menu</h2>
          <p className="text-muted">
            Silakan pilih tindakan yang ingin Anda lakukan.
          </p>
        </Col>
      </Row>

      <Row className="mt-4">
        {/* Card 1: Input Menu Baru */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Input Menu Baru</Card.Title>
              <Card.Text>
                Gunakan halaman ini untuk mendaftarkan menu baru ke dalam sistem
                kasir Anda.
              </Card.Text>

              {/* === PERBAIKAN DI SINI ===
                Button-nya dibungkus di dalam Link.
                Bukan lagi <Button as={Link}...>
              */}
              <Link href="/menu/input" className="mt-auto">
                <Button variant="primary" className="w-100">
                  Pergi ke Halaman Input
                </Button>
              </Link>
              {/* ======================= */}
            </Card.Body>
          </Card>
        </Col>

        {/* Card 2: Lihat & Kelola Menu */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Lihat & Kelola Menu</Card.Title>
              <Card.Text>
                Lihat semua menu yang sudah ada. Anda bisa mengubah harga, nama,
                foto, atau menghapus menu.
              </Card.Text>

              {/* === PERBAIKAN DI SINI ===
                Button-nya juga dibungkus di dalam Link
              */}
              <Link href="/menu/kelola" className="mt-auto">
                <Button variant="secondary" className="w-100">
                  Pergi ke Halaman Kelola
                </Button>
              </Link>
              {/* ======================= */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}