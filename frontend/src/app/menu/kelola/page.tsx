"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

const formatCurrency = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default function KelolaMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editModal, setEditModal] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [newFileGambar, setNewFileGambar] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadBootstrap = async () => {
        try {
          const bootstrap: any = await import("bootstrap/dist/js/bootstrap.bundle.min.js");
          const editModalEl = document.getElementById("editProductModal");
          if (editModalEl) setEditModal(new bootstrap.Modal(editModalEl));
          const deleteModalEl = document.getElementById("deleteConfirmModal");
          if (deleteModalEl) setDeleteModal(new bootstrap.Modal(deleteModalEl));
        } catch (error) {
          console.error("Gagal memuat bootstrap:", error);
        }
      };
      loadBootstrap();
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/menu/`);
      const productResponse = await res.json();
      if (!res.ok) throw new Error(productResponse.message || "Gagal mengambil data");

      const formattedProducts = productResponse.map((p: any) => ({
        ...p,
        name: p.nama,
        price: parseFloat(p.harga) || 0,
        image: p.gambar,
        category: p.category || 'Makanan',
        stock: p.stock || 0,
      }));

      setProducts(formattedProducts || []);
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    } else {
      fetchProducts();
    }
  }, [user, authLoading, router, fetchProducts]);

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    if(deleteModal) deleteModal.show();
  };

  const executeDelete = async () => {
    if (!productToDelete) return;

    try {
      await fetch(`${API_URL}/menu/${productToDelete}`, { method: "DELETE" });
      fetchProducts();
      if(deleteModal) deleteModal.hide();
      setProductToDelete(null);
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
    }
  };

  const openEditModal = (product: Product) => {
    setNewFileGambar(null);
    setCurrentProduct(product);
    if (editModal) editModal.show();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;
    const formData = new FormData();
    formData.append('nama', currentProduct.name);
    formData.append('harga', currentProduct.price.toString());
    formData.append('category', currentProduct.category);
    formData.append('stock', currentProduct.stock.toString());
    if (newFileGambar) {
      formData.append('gambar', newFileGambar);
    } else if (!currentProduct.image) {
      formData.append('gambar', '');
    }

    try {
      const res = await fetch(`${API_URL}/menu/update/${currentProduct._id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Gagal mengupdate produk");

      fetchProducts();
      if (editModal) editModal.hide();
    } catch (error) {
      console.error("Gagal mengupdate produk:", error);
    }
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (currentProduct) {
      const { name, value, type } = e.target;
      if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files?.[0]) {
        setNewFileGambar(e.target.files[0]);
        setCurrentProduct({ ...currentProduct, image: URL.createObjectURL(e.target.files[0]) });
        return;
      }
      if (type === "number") {
        setCurrentProduct({ ...currentProduct, [name]: value === "" ? "" : parseFloat(value) });
      } else {
        setCurrentProduct({ ...currentProduct, [name]: value });
      }
    }
  };

  const removeExistingImage = () => {
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, image: "" });
      setNewFileGambar(null);
    }
  };

  if (authLoading || !user) {
    return <div style={{ textAlign: 'center', paddingTop: '4rem' }}><p style={{ color: '#666' }}>Memverifikasi akses...</p></div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="container-fluid px-3 px-md-5">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Tombol Kembali */}
          <Link href="/menu" style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none', 
              color: '#1a1a1a',
              fontSize: '0.95rem',
              marginBottom: '2rem',
              padding: '0.6rem 1.2rem',
              border: '1px solid #ced4da',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.backgroundColor = '#f1f3f5';
              e.currentTarget.style.borderColor = '#adb5bd';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#ced4da';
            }}
          >
             <div style={{
                width: '26px',
                height: '26px',
                backgroundColor: '#495057',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.8rem',
                color: '#fff', 
                fontSize: '0.9rem',
                paddingBottom: '2px'
             }}>
               ←
             </div>
            Kembali
          </Link>
  
          <div style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '1px', color: '#1a1a1a', marginBottom: '0.5rem' }}>
              Kelola Menu
            </h1>
            <div style={{ width: '40px', height: '1px', backgroundColor: '#d4af37', marginBottom: '1rem' }}></div>
            <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: '300' }}>
              Lihat, edit, dan kelola menu dari sistem
            </p>
          </div>
  
          <div style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Cari nama menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '350px',
                padding: '0.75rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '2px',
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
  
          {/* === BAGIAN UTAMA: TABEL vs KARTU === */}
          
          {loading ? (
             <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>Memuat data...</div>
          ) : filteredProducts.length === 0 ? (
             <div style={{ padding: '3rem', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>{searchQuery ? `Menu "${searchQuery}" tidak ditemukan` : "Belum ada menu terdaftar"}</div>
          ) : (
            <>
              {/* TAMPILAN DESKTOP (TABEL) - Hanya muncul di layar MD ke atas */}
              <div className="d-none d-md-block" style={{ backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #e8e8e8' }}>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontWeight: '500', color: '#1a1a1a', fontSize: '0.85rem', width: '80px' }}>ID</th>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontWeight: '500', color: '#1a1a1a', fontSize: '0.85rem' }}>Foto</th>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontWeight: '500', color: '#1a1a1a', fontSize: '0.85rem' }}>Nama Menu</th>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontWeight: '500', color: '#1a1a1a', fontSize: '0.85rem' }}>Kategori</th>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontWeight: '500', color: '#1a1a1a', fontSize: '0.85rem' }}>Harga</th>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'left', fontWeight: '500', color: '#1a1a1a', fontSize: '0.85rem' }}>Stok</th>
                        <th style={{ padding: '1.2rem 1.5rem', textAlign: 'center', fontWeight: '500', color: '#1a1a1a', fontSize: '0.85rem' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product._id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background-color 0.2s ease' }}>
                            <td style={{ padding: '1.2rem 1.5rem', color: '#888', fontSize: '0.8rem', fontFamily: 'monospace' }}>0{product._id.slice(-5)}</td>
                            <td style={{ padding: '1.2rem 1.5rem' }}>
                              <img src={product.image || "https://via.placeholder.com/80x80?text=No+Img"} alt={product.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e8e8e8' }} />
                            </td>
                            <td style={{ padding: '1.2rem 1.5rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.95rem' }}>{product.name}</td>
                            <td style={{ padding: '1.2rem 1.5rem' }}><span style={{ display: 'inline-block', backgroundColor: '#f5f5f5', color: '#666', padding: '0.35rem 0.8rem', borderRadius: '2px', fontSize: '0.8rem', fontWeight: '300' }}>{product.category}</span></td>
                            <td style={{ padding: '1.2rem 1.5rem', fontWeight: '400', color: '#1a1a1a', fontSize: '0.95rem' }}>{formatCurrency(product.price)}</td>
                            <td style={{ padding: '1.2rem 1.5rem' }}><span style={{ display: 'inline-block', backgroundColor: product.stock > 0 ? '#f0f0f0' : '#ffe6e6', color: product.stock > 0 ? '#666' : '#c00', padding: '0.35rem 0.8rem', borderRadius: '2px', fontSize: '0.9rem', fontWeight: '400' }}>{product.stock}</span></td>
                            <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                              <button onClick={() => openEditModal(product)} style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a', border: '1px solid #ddd', padding: '0.5rem 0.9rem', borderRadius: '2px', cursor: 'pointer', marginRight: '0.5rem', fontSize: '0.85rem', transition: 'all 0.3s ease' }}>Edit</button>
                              <button onClick={() => confirmDelete(product._id)} style={{ backgroundColor: '#ffe6e6', color: '#c00', border: '1px solid #dcc', padding: '0.5rem 0.9rem', borderRadius: '2px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s ease' }}>Hapus</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
  
              {/* TAMPILAN MOBILE (CARD LIST) - Hanya muncul di layar kecil (dibawah MD) */}
              <div className="d-md-none">
                {filteredProducts.map((product) => (
                  <div key={product._id} style={{ backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <img 
                        src={product.image || "https://via.placeholder.com/80x80?text=No+Img"} 
                        alt={product.name} 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #f0f0f0' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: '#888', fontFamily: 'monospace', marginBottom: '0.2rem' }}>#{product._id.slice(-5)}</div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a', margin: '0 0 0.3rem 0' }}>{product.name}</h3>
                        <span style={{ display: 'inline-block', backgroundColor: '#f5f5f5', color: '#666', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem' }}>{product.category}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5', padding: '0.8rem 0', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem' }}>Harga</div>
                        <div style={{ fontWeight: '500', color: '#1a1a1a' }}>{formatCurrency(product.price)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem' }}>Stok</div>
                        <span style={{ 
                          display: 'inline-block', 
                          color: product.stock > 0 ? '#1a1a1a' : '#c00', 
                          fontWeight: '500'
                        }}>
                          {product.stock}
                        </span>
                      </div>
                    </div>
  
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      <button 
                        onClick={() => openEditModal(product)} 
                        style={{ backgroundColor: '#f8f9fa', color: '#1a1a1a', border: '1px solid #ddd', padding: '0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', textAlign: 'center' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => confirmDelete(product._id)} 
                        style={{ backgroundColor: '#fff5f5', color: '#c00', border: '1px solid #fcc', padding: '0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', textAlign: 'center' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
  
        </div>
      </div>
  
      {/* --- MODAL EDIT MENU (RESPONSIF) --- */}
      <div className="modal fade" id="editProductModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '900px', width: '95%' }}>
          <div className="modal-content" style={{ border: 'none', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
             <form onSubmit={handleEditSubmit}>
                
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: '0', fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a' }}>Edit Menu</h5>
                    <button type="button" onClick={() => editModal?.hide()} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor:'pointer', color: '#999' }}>×</button>
                </div>
  
                <div style={{ padding: '2rem' }}>
                    {currentProduct && (
                        /* Menggunakan Bootstrap Grid agar responsif */
                        <div className="row g-4">
                             
                             {/* KOLOM KIRI: FOTO */}
                             <div className="col-lg-4 text-center text-lg-start">
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '500', color: '#1a1a1a', fontSize: '0.9rem', textAlign: 'left' }}>Foto Menu</label>
                                <div style={{ 
                                    border: '1px solid #eee', 
                                    padding: '1rem', 
                                    borderRadius: '8px', 
                                    backgroundColor: '#fafafa'
                                }}>
                                    {currentProduct.image ? (
                                        <>
                                            <img 
                                                src={currentProduct.image} 
                                                alt="Preview" 
                                                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={removeExistingImage} 
                                                style={{
                                                    width: '100%',
                                                    padding: '0.6rem',
                                                    backgroundColor: '#fff',
                                                    color: '#c00',
                                                    border: '1px solid #ffcccc',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#ffe6e6'}}
                                                onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#fff'}}
                                            >
                                                Hapus Foto
                                            </button>
                                        </>
                                    ) : (
                                        <div style={{ padding: '3rem 0', color: '#999', fontSize: '0.9rem' }}>
                                            Belum ada foto
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginTop: '1rem', textAlign: 'left' }}>
                                    <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.4rem' }}>Ganti/Upload Baru:</label>
                                    <input type="file" className="form-control" name="file" onChange={handleModalInputChange} accept="image/*" style={{ fontSize: '0.85rem' }} />
                                </div>
                             </div>
  
                             {/* KOLOM KANAN: DATA MENU */}
                             <div className="col-lg-8">
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Nama Menu</label>
                                    <input type="text" className="form-control" name="name" value={currentProduct.name} onChange={handleModalInputChange} required style={{ padding: '0.7rem', fontSize: '0.95rem' }} />
                                </div>
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Kategori</label>
                                    <select className="form-select" name="category" value={currentProduct.category} onChange={handleModalInputChange} style={{ padding: '0.7rem', fontSize: '0.95rem', cursor: 'pointer' }}>
                                        <option value="Makanan">Makanan</option>
                                        <option value="Minuman">Minuman</option>
                                        <option value="Cemilan">Cemilan</option>
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-6" style={{ marginBottom: '1.2rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Harga (Rp)</label>
                                        <input type="number" className="form-control" name="price" value={currentProduct.price} onChange={handleModalInputChange} required style={{ padding: '0.7rem', fontSize: '0.95rem' }} />
                                    </div>
                                    <div className="col-6" style={{ marginBottom: '1.2rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Stok</label>
                                        <input type="number" className="form-control" name="stock" value={currentProduct.stock} onChange={handleModalInputChange} required style={{ padding: '0.7rem', fontSize: '0.95rem' }} />
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
  
                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#fafafa' }}>
                    <button type="button" onClick={() => editModal?.hide()} style={{ padding: '0.6rem 1.5rem', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                    <button type="submit" style={{ padding: '0.6rem 1.5rem', border: 'none', background: '#1a1a1a', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Simpan Perubahan</button>
                </div>
             </form>
          </div>
        </div>
      </div>
  
      {/* --- MODAL CONFIRM DELETE --- */}
      <div className="modal fade" id="deleteConfirmModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
          <div className="modal-content" style={{ border: 'none', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ffe6e6', color: '#c00', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>!</div>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: '500', color: '#1a1a1a' }}>Hapus Menu Ini?</h4>
              <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '2rem' }}>Tindakan ini tidak dapat dibatalkan. Data menu akan hilang permanen dari database.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button type="button" onClick={() => deleteModal?.hide()} style={{ padding: '0.8rem', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', fontWeight: '500', color: '#333' }}>Batal</button>
                <button type="button" onClick={executeDelete} style={{ padding: '0.8rem', backgroundColor: '#c00', border: '1px solid #c00', borderRadius: '4px', fontWeight: '500', color: '#fff' }}>Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
    </div>
  );
}