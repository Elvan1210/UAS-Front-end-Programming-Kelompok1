'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';

export default function AppNavbar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      expanded={expanded}
      className="shadow-sm"
    >
      <Container>
        <Navbar.Brand as={Link} href="/">
          Kasir UMKM
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              href="/"
              className={pathname === '/' ? 'active fw-semibold' : ''}
              onClick={() => setExpanded(false)}
            >
              Dashboard
            </Nav.Link>

            <Nav.Link
              as={Link}
              href="/menu"
              className={pathname.startsWith('/menu') ? 'active fw-semibold' : ''}
              onClick={() => setExpanded(false)}
            >
              Menu
            </Nav.Link>

            <Nav.Link
              as={Link}
              href="/kasir"
              className={pathname === '/kasir' ? 'active fw-semibold' : ''}
              onClick={() => setExpanded(false)}
            >
              Kasir
            </Nav.Link>

            <Nav.Link
              as={Link}
              href="/transaksi"
              className={pathname === '/transaksi' ? 'active fw-semibold' : ''}
              onClick={() => setExpanded(false)}
            >
              Transaksi
            </Nav.Link>

          </Nav>

          <Nav>
            <NavDropdown title="elpan121004@gmail.com" align="end">
              <NavDropdown.Item as={Link} href="/profile">
                Profil
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} href="/logout">
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
