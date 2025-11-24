"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";

// konfigurasi url api
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// definisi tipe data menu
interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

// format mata uang rupiah
const formatCurrency = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default function KelolaMenuPage() {
  // inisialisasi state aplikasi
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // state untuk kontrol modal
  const [editModal, setEditModal] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  
  // state untuk data yang sedang diolah
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [newFileGambar, setNewFileGambar] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // memuat library bootstrap secara dinamis
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

  // mengambil data menu dari server
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

  // cek otentikasi dan muat data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    } else {
      fetchProducts();
    }
  }, [user, authLoading, router, fetchProducts]);

  // filter menu berdasarkan pencarian
  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // logika persiapan hapus data
  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    if(deleteModal) deleteModal.show();
  };

  // eksekusi hapus data ke server
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

  // buka modal edit dengan data terpilih
  const openEditModal = (product: Product) => {
    setNewFileGambar(null);
    setCurrentProduct(product);
    if (editModal) editModal.show();
  };

  // proses simpan perubahan menu
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

  // handle perubahan input pada form modal
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

  // hapus gambar yang ada di state
  const removeExistingImage = () => {
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, image: "" });
      setNewFileGambar(null);
    }
  };

  // tampilan loading saat verifikasi
  if (authLoading || !user) {
    return <div style={{ textAlign: 'center', paddingTop: '4rem' }}><p style={{ color: '#666' }}>Memverifikasi akses...</p></div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
        
        {/* tombol kembali */}
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

        {/* judul halaman */}
        <div style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '1px', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Kelola Menu
          </h1>
          <div style={{ width: '40px', height: '1px', backgroundColor: '#d4af37', marginBottom: '1rem' }}></div>
          <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: '300' }}>
            Lihat, edit, dan kelola menu dari sistem
          </p>
        </div>

        {/* kolom pencarian menu */}
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

        {/* tabel daftar menu */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: '2px', overflow: 'hidden' }}>
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
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>Memuat data...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>{searchQuery ? `Menu "${searchQuery}" tidak ditemukan` : "Belum ada menu terdaftar"}</td></tr>
                ) : (
                  filteredProducts.map((product) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* modal edit menu */}
      <div className="modal fade" id="editProductModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '900px' }}>
          <div className="modal-content" style={{ border: 'none', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
             <form onSubmit={handleEditSubmit}>
                
                {/* bagian header modal */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: '0', fontSize: '1.3rem', fontWeight: '600', color: '#1a1a1a' }}>Edit Menu</h5>
                    <button type="button" onClick={() => editModal?.hide()} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor:'pointer', color: '#999' }}>×</button>
                </div>

                {/* bagian isi modal dua kolom */}
                <div style={{ padding: '2rem' }}>
                    {currentProduct && (
                        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2.5rem' }}>
                             
                             {/* kolom kiri untuk foto */}
                             <div>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '500', color: '#1a1a1a', fontSize: '0.9rem' }}>Foto Menu</label>
                                <div style={{ 
                                    border: '1px solid #eee', 
                                    padding: '1rem', 
                                    borderRadius: '8px', 
                                    textAlign: 'center',
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
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.4rem' }}>Ganti/Upload Baru:</label>
                                    <input type="file" className="form-control" name="file" onChange={handleModalInputChange} accept="image/*" style={{ fontSize: '0.85rem' }} />
                                </div>
                             </div>

                             {/* kolom kanan untuk data menu */}
                             <div>
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ marginBottom: '1.2rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Harga (Rp)</label>
                                        <input type="number" className="form-control" name="price" value={currentProduct.price} onChange={handleModalInputChange} required style={{ padding: '0.7rem', fontSize: '0.95rem' }} />
                                    </div>
                                    <div style={{ marginBottom: '1.2rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Stok</label>
                                        <input type="number" className="form-control" name="stock" value={currentProduct.stock} onChange={handleModalInputChange} required style={{ padding: '0.7rem', fontSize: '0.95rem' }} />
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* bagian tombol aksi modal */}
                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#fafafa' }}>
                    <button type="button" onClick={() => editModal?.hide()} style={{ padding: '0.6rem 1.5rem', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                    <button type="submit" style={{ padding: '0.6rem 1.5rem', border: 'none', background: '#1a1a1a', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Simpan Perubahan</button>
                </div>
             </form>
          </div>
        </div>
      </div>

      {/* modal konfirmasi hapus menu */}
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