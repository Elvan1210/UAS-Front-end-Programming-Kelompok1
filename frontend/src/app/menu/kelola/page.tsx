"use client";

// 1. IMPORT hook yang diperlukan
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext"; // <-- 2. IMPORT AUTH CONTEXT

const API_URL = "http://localhost:5000";

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

const ContentHeader = ({ title }: { title: string }) => (
  <header className="content-header">
    <h1>{title}</h1>
  </header>
);

export default function KelolaMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  // 'loading' ini untuk 'fetchProducts', BUKAN auth
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<any>(null);
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [newFileGambar, setNewFileGambar] = useState<File | null>(null);
  const router = useRouter();

  // <-- 3. AMBIL STATUS AUTH DARI CONTEXT
  // Kita pakai 'authLoading' agar tidak bentrok dengan state 'loading' Anda
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const bootstrap = require("bootstrap/dist/js/bootstrap.bundle.min.js");
      const modalEl = document.getElementById("editProductModal");
      if (modalEl) {
        setEditModal(new bootstrap.Modal(modalEl));
      }
    }
  }, []);

  // <-- 4. KITA BUNGKUS fetchProducts DENGAN useCallback
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/menu/`);
      const productResponse = await res.json();

      if (!res.ok)
        throw new Error(productResponse.message || "Gagal mengambil data produk");

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
  }, []); // Dependensi kosong karena tidak bergantung state/props

  // <-- 5. UBAH TOTAL LOGIC useEffect INI (LOGIC PROTEKSI)
  useEffect(() => {
    // 1. Tunggu sampai context selesai mengecek auth
    if (authLoading) {
      return; // Jangan lakukan apa-apa
    }

    // 2. Auth selesai dicek, kita lihat hasilnya
    if (!user) {
      // Jika TIDAK ada user, "mental" ke login
      router.push('/login');
    } else {
      // Jika ADA user, baru ambil data produk
      fetchProducts();
    }
  }, [user, authLoading, router, fetchProducts]); // Ini adalah dependensi yang benar

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
      try {
        await fetch(`${API_URL}/menu/${id}`, { method: "DELETE" });
        fetchProducts();
      } catch (error) {
        console.error("Gagal menghapus produk:", error);
      }
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
    } else if (currentProduct.image === null || currentProduct.image === "") {
      formData.append('gambar', '');
    }

    try {
      const res = await fetch(`${API_URL}/menu/update/${currentProduct._id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal mengupdate produk");
      }

      fetchProducts();
      if (editModal) editModal.hide();
    } catch (error) {
      console.error("Gagal mengupdate produk:", error);
    }
  };

  const handleModalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (currentProduct) {
      const { name, value, type } = e.target;

      if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files && e.target.files[0]) {
        setNewFileGambar(e.target.files[0]);
        setCurrentProduct({ ...currentProduct, image: URL.createObjectURL(e.target.files[0]) }); // Tampilkan preview (opsional)
        return;
      }

      if (type === "number") {
        if (value === "") {
          setCurrentProduct({ ...currentProduct, [name]: "" });
        } else if (!isNaN(parseFloat(value))) {
          setCurrentProduct({ ...currentProduct, [name]: parseFloat(value) });
        }
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

  // <-- 6. TAMBAHKAN "GERBANG LOADING" UNTUK AUTH
  // Ini akan menampilkan "Loading..." halaman penuh SEBELUM
  // halaman kelola Anda dirender, ini mencegah "kedipan".
  if (authLoading || !user) {
    return (
      <div className="container mt-5 text-center">
        <h3>Mengecek otentikasi...</h3>
        {/* Anda bisa tambahkan spinner di sini */}
      </div>
    );
  }

  // <-- 7. KODE RETURN ANDA DI BAWAH INI SEKARANG AMAN
  // Ini hanya akan dieksekusi jika 'authLoading' selesai DAN 'user' ada.
  return (
    <>
      <ContentHeader title="Lihat & Kelola Menu" />
      <Link href="/menu" className="btn btn-outline-secondary mb-3">
        <i className="bi bi-arrow-left-circle-fill"></i> Kembali
      </Link>

      <div className="content-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Foto</th>
                <th>ID</th>
                <th>Nama Menu</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center">Memuat data...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">Belum ada produk.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.image || "https://via.placeholder.com/100/CCCCCC/808080?text=NO+IMG"}
                        alt={product.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </td>
                    <td>{product._id.slice(-6)}</td>
                    <td>{product.name}</td>
                    <td>
                      <span className="badge bg-secondary">
                        {product.category}
                      </span>
                    </td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => openEditModal(product)}
                      >
                        <i className="bi bi-pencil-fill"></i> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(product._id)}
                      >
                        <i className="bi bi-trash-fill"></i> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* */}
      <div className="modal fade" id="editProductModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleEditSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Menu</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                {currentProduct && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="edit-name" className="form-label">Nama Menu</label>
                      <input
                        type="text"
                        className="form-control"
                        id="edit-name"
                        name="name"
                        value={currentProduct.name}
                        onChange={handleModalInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="edit-category" className="form-label">Kategori</label>
                      <select
                        className="form-select"
                        id="edit-category"
                        name="category"
                        value={currentProduct.category}
                        onChange={handleModalInputChange}
                        required
                      >
                        <option value="Makanan">Makanan</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Cemilan">Cemilan</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="edit-price" className="form-label">Harga (Rp)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="edit-price"
                        name="price"
                        value={currentProduct.price ?? ""}
                        onChange={handleModalInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="edit-stock" className="form-label">Stok</label>
                      <input
                        type="number"
                        className="form-control"
                        id="edit-stock"
                        name="stock"
                        value={currentProduct.stock ?? ""}
                        onChange={handleModalInputChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label d-block">Foto Menu Saat Ini:</label>
                        {(currentProduct.image) ? (
                            <div className="d-flex align-items-center mb-2">
                                <img
                                    src={currentProduct.image}
                                    alt={currentProduct.name}
                                    style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                                    className="img-thumbnail me-3"
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={removeExistingImage}
                                >
                                    Hapus Foto
                                </button>
                            </div>
                        ) : (
                            <p className="text-muted">Tidak ada foto terdaftar.</p>
                        )}
                        
                        <label htmlFor="edit-file" className="form-label mt-2">Ganti Foto Menu</label>
                        <input
                          type="file"
                          className="form-control"
                          id="edit-file"
                          name="file"
                          accept="image/*"
                          onChange={handleModalInputChange}
                        />
                        {newFileGambar && (
                            <small className="text-success">File baru siap diupload: {newFileGambar.name}</small>
                        )}
                    </div>
                    
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save-fill"></i> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}