import React, { useEffect, useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit,
  FiTrash2,
  FiPlusCircle,
  FiMinusCircle,
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

// =================================================================================
// KOMPONEN LAYOUT BERSAMA (SHARED LAYOUT COMPONENT)
// =================================================================================
// Komponen ini berisi Sidebar dan area konten utama.
// Bagian <aside> telah diganti sesuai permintaan Anda.

// --- Navigasi Items untuk Sidebar Baru ---
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/pesanan", label: "Pemesanan", icon: "🛒" },
  { to: "/produk", label: "Produk", icon: "💊" },
  { to: "/report", label: "Report Penjualan", icon: "📈" },
  { to: "/pengaturan", label: "Pengaturan", icon: "⚙️" },
  { to: "/keluar", label: "Keluar", icon: "🚪" },
];

const Layout = ({ children, activePage }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - KODE BARU DITERAPKAN DI SINI */}
      <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-white/20 p-6 shadow-xl flex-shrink-0">
        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-10 text-center">
          <div className="text-3xl mb-2">🏥</div>
          Apotek ANTARES
        </div>
        <nav>
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li
                key={item.label}
                className="transform transition-all duration-200 hover:scale-105"
              >
                <a
                  href={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer
                    ${
                      activePage === item.label
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" // Gaya untuk item aktif
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white" // Gaya default dan hover
                    }`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area - Tidak ada perubahan */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
    </div>
  );
};

// =================================================================================
// HALAMAN MANAJEMEN PRODUK (PRODUCT MANAGEMENT PAGE)
// =================================================================================
// TIDAK ADA PERUBAHAN PADA KODE DI BAWAH INI

// --- Variabel & Konstanta untuk Produk ---
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_URL = `${API_BASE_URL}/obat`;

const KATEGORI_OBAT = [
  "Semua Kategori",
  "Obat Resep",
  "Obat Bebas",
  "Vitamin & Suplemen",
  "Perawatan Pribadi",
];

// --- Sub-Komponen Halaman Produk ---
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-20 bg-white rounded-lg shadow-md">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
    <p className="mt-4 text-lg text-gray-600 font-semibold">
      Memuat data produk...
    </p>
  </div>
);

const AddProductForm = ({ onAddProduct }) => {
  const initialFormState = {
    nama_obat: "",
    deskripsi: "",
    dosis: "",
    harga_satuan: "",
    harga_grosir: "",
    stok: "",
    kategori: "Obat Bebas",
    foto: "",
  };
  const [newProduct, setNewProduct] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.nama_obat || !newProduct.harga_satuan || !newProduct.stok) {
      toast.error("Nama Obat, Harga Satuan, dan Stok wajib diisi!");
      return;
    }
    const payload = {
      ...newProduct,
      harga_satuan:
        parseInt(String(newProduct.harga_satuan).replace(/\D/g, "")) || 0,
      harga_grosir:
        parseInt(String(newProduct.harga_grosir).replace(/\D/g, "")) || 0,
      stok: parseInt(String(newProduct.stok).replace(/\D/g, "")) || 0,
    };
    onAddProduct(payload);
    setNewProduct(initialFormState);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Tambah Obat Baru
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="lg:col-span-2">
          <label
            htmlFor="nama_obat"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Nama Obat <span className="text-red-500">*</span>
          </label>
          <input
            id="nama_obat"
            name="nama_obat"
            type="text"
            placeholder="Contoh: Paracetamol 500mg"
            value={newProduct.nama_obat}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <div>
          <label
            htmlFor="kategori"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Kategori
          </label>
          <select
            id="kategori"
            name="kategori"
            value={newProduct.kategori}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            {KATEGORI_OBAT.slice(1).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="dosis"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Dosis
          </label>
          <input
            id="dosis"
            name="dosis"
            type="text"
            placeholder="Contoh: 3x sehari"
            value={newProduct.dosis}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <div>
          <label
            htmlFor="harga_satuan"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Harga Satuan <span className="text-red-500">*</span>
          </label>
          <input
            id="harga_satuan"
            name="harga_satuan"
            type="number"
            placeholder="Contoh: 5000"
            value={newProduct.harga_satuan}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <div>
          <label
            htmlFor="harga_grosir"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Harga Grosir
          </label>
          <input
            id="harga_grosir"
            name="harga_grosir"
            type="number"
            placeholder="Contoh: 4500"
            value={newProduct.harga_grosir}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <div>
          <label
            htmlFor="stok"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Stok <span className="text-red-500">*</span>
          </label>
          <input
            id="stok"
            name="stok"
            type="number"
            placeholder="Contoh: 100"
            value={newProduct.stok}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <div>
          <label
            htmlFor="foto"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            URL Foto
          </label>
          <input
            id="foto"
            name="foto"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={newProduct.foto}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <label
            htmlFor="deskripsi"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Deskripsi
          </label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            placeholder="Deskripsi singkat mengenai obat..."
            value={newProduct.deskripsi}
            onChange={handleChange}
            rows="2"
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <button
          type="submit"
          className="col-span-full mt-2 bg-blue-600 text-white py-2.5 rounded-lg shadow hover:bg-blue-700 transition-colors duration-300 font-semibold"
        >
          Tambah Obat
        </button>
      </form>
    </div>
  );
};

const ProductCard = ({ product, onEdit, onDelete, onUpdateStock }) => {
  const handleStockChange = (delta) => {
    const payload = {
      nama_obat: product.name,
      deskripsi: product.description,
      dosis: product.dosis,
      harga_satuan: product.price,
      harga_grosir: product.harga_grosir,
      stok: Math.max(0, product.stock + delta),
      kategori: product.kategori,
      foto: product.foto,
    };
    onUpdateStock(product.id, payload);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow hover:shadow-2xl"
    >
      <img
        src={
          product.foto ||
          "https://via.placeholder.com/400x300.png/E2E8F0/4A5568?text=No+Image"
        }
        alt={product.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4 flex flex-col flex-grow">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full self-start mb-2 ${
            product.kategori === "Obat Resep"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {product.kategori}
        </span>
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mt-1 flex-grow line-clamp-3">
          {product.description || "Tidak ada deskripsi."}
        </p>
        <div className="mt-4">
          <p className="text-xl font-black text-green-600">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <span className="font-semibold">Stok:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStockChange(-1)}
                disabled={product.stock <= 0}
                className="text-red-500 disabled:text-gray-300 hover:text-red-700 transition-colors"
              >
                <FiMinusCircle size={20} />
              </button>
              <span
                className={`font-bold text-lg ${
                  product.stock < 10 && product.stock > 0
                    ? "text-orange-500"
                    : product.stock === 0
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                {product.stock}
              </span>
              <button
                onClick={() => handleStockChange(1)}
                className="text-green-500 hover:text-green-700 transition-colors"
              >
                <FiPlusCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t">
        <button
          onClick={() => onEdit(product)}
          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors"
          title="Edit Produk"
        >
          <FiEdit size={18} />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
          title="Hapus Produk"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

const ProductList = ({ products, onEdit, onDelete, onUpdateStock }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold">Produk Tidak Ditemukan</h3>
        <p className="mt-2">
          Coba ubah kata kunci pencarian atau filter kategori Anda.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdateStock={onUpdateStock}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const EditProductModal = ({ product, onClose, onSave }) => {
  const [editedProduct, setEditedProduct] = useState({
    nama_obat: product.name,
    deskripsi: product.description,
    dosis: product.dosis,
    harga_satuan: product.price,
    harga_grosir: product.harga_grosir,
    stok: product.stock,
    kategori: product.kategori,
    foto: product.foto,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...editedProduct,
      harga_satuan:
        parseInt(String(editedProduct.harga_satuan).replace(/\D/g, "")) || 0,
      harga_grosir:
        parseInt(String(editedProduct.harga_grosir).replace(/\D/g, "")) || 0,
      stok: parseInt(String(editedProduct.stok).replace(/\D/g, "")) || 0,
    };
    onSave(product.id, payload);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-semibold mb-6">
            Edit Produk: <span className="font-bold">{product.name}</span>
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5"
          >
            {Object.keys(editedProduct).map((key) => (
              <div
                key={key}
                className={key === "deskripsi" ? "md:col-span-2" : ""}
              >
                <label
                  htmlFor={`edit-${key}`}
                  className="block text-sm font-medium text-gray-700 capitalize mb-1"
                >
                  {key.replace(/_/g, " ")}
                </label>
                {key === "kategori" ? (
                  <select
                    id={`edit-${key}`}
                    name={key}
                    value={editedProduct[key]}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {KATEGORI_OBAT.slice(1).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                ) : key === "deskripsi" ? (
                  <textarea
                    id={`edit-${key}`}
                    name={key}
                    value={editedProduct[key] || ""}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <input
                    type={
                      key.includes("harga") || key === "stok"
                        ? "number"
                        : key === "foto"
                        ? "url"
                        : "text"
                    }
                    id={`edit-${key}`}
                    name={key}
                    value={editedProduct[key] || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            ))}
            <div className="col-span-full flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Komponen Utama Halaman Produk (Main Component) ---
const ProductManagementContent = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua Kategori");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!loading) setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Gagal mengambil data dari server");
      const data = await res.json();
      const mapped = data.map((item) => ({
        id: item.obat_id,
        name: item.nama_obat,
        description: item.deskripsi,
        dosis: item.dosis,
        price: parseInt(item.harga_satuan) || 0,
        harga_grosir: parseInt(item.harga_grosir) || 0,
        stock: parseInt(item.stok) || 0,
        kategori: item.kategori,
        foto: item.foto,
      }));
      setProducts(mapped);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      toast.error(err.message || "Gagal mengambil data dari server.");
    } finally {
      setLoading(false);
    }
  };

  const handleApiCall = async (apiCall, successMessage, errorMessage) => {
    const toastId = toast.loading("Memproses permintaan...");
    try {
      await apiCall();
      toast.success(successMessage, { id: toastId });
      await fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.message || errorMessage, { id: toastId });
    }
  };

  const addProduct = async (newProduct) => {
    await handleApiCall(
      async () => {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Gagal menambahkan obat baru");
        }
      },
      "Produk berhasil ditambahkan!",
      "Gagal menambahkan produk."
    );
  };

  const updateProduct = async (id, updatedData) => {
    await handleApiCall(
      async () => {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Gagal memperbarui data obat");
        }
      },
      "Produk berhasil diperbarui!",
      "Gagal memperbarui produk."
    );
    if (editingProduct) setEditingProduct(null);
  };

  const deleteProduct = async (id) => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2 p-2">
          <b>Konfirmasi Hapus</b>
          <p>Yakin ingin menghapus produk ini?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleApiCall(
                  async () => {
                    const response = await fetch(`${API_URL}/${id}`, {
                      method: "DELETE",
                    });
                    if (!response.ok) throw new Error("Gagal menghapus produk");
                  },
                  "Produk berhasil dihapus!",
                  "Gagal menghapus produk."
                );
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Ya, Hapus
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Batal
            </button>
          </div>
        </span>
      ),
      { duration: 6000 }
    );
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((product) =>
        filterCategory === "Semua Kategori"
          ? true
          : product.kategori === filterCategory
      );
  }, [products, searchTerm, filterCategory]);

  return (
    <div className="max-w-7xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Manajemen Produk
        </h1>
        <a
          href="/stok-opname"
          className="bg-green-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 font-semibold"
        >
          Stok Opname
        </a>
      </header>

      <AddProductForm onAddProduct={addProduct} />

      <div className="bg-white shadow-md rounded-lg p-4 my-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama obat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 pl-10 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full md:w-1/2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
        >
          {KATEGORI_OBAT.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ProductList
          products={filteredProducts}
          onEdit={setEditingProduct}
          onDelete={deleteProduct}
          onUpdateStock={updateProduct}
        />
      )}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={updateProduct}
        />
      )}
    </div>
  );
};

// =================================================================================
// KOMPONEN EXPORT UTAMA (MAIN EXPORTED COMPONENT)
// =================================================================================
// Ini adalah komponen yang akan Anda ekspor dan gunakan di router Anda.
// Ia menggunakan Layout untuk membungkus konten manajemen produk.

const ProductManagementPage = () => {
  return (
    <Layout activePage="Produk">
      <ProductManagementContent />
    </Layout>
  );
};

export default ProductManagementPage;
