import React, { useEffect, useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit,
  FiTrash2,
  FiPlusCircle,
  FiMinusCircle,
} from "react-icons/fi";

// =================================================================================
// KONSTANTA & API
// =================================================================================
const API_BASE_URL = "https://apotekantares.my.id/api";
const API_URL = `${API_BASE_URL}/obat`;

const KATEGORI_OBAT = [
  "Semua Kategori",
  "Obat Keras",
  "Obat Bebas Terbatas",
  "Obat Bebas",
  "Obat Herbal",
  "Vitamin & Suplemen",
  "Skincare",
];

const GOLONGAN_OBAT = [
  "Obat Keras",
  "Obat Bebas Terbatas",
  "Obat Bebas",
  "Obat Herbal",
];

// Inisialisasi state awal yang kosong untuk form produk, sesuai dengan struktur ProductDetail.
const INITIAL_PRODUCT_STATE = {
  nama_obat: "",
  harga_satuan: "",
  harga_grosir: "", // Ditambahkan
  stok: "",
  foto: "",
  satuan: "",
  deskripsi: "",
  komposisi: "",
  kemasan: "",
  manfaat: "",
  kategori: "Obat Bebas",
  dosis: "",
  penyajian: "",
  cara_penyimpanan: "",
  perhatian: "",
  efek_samping: "",
  nama_standar_mims: "",
  nomor_izin_edar: "",
  golongan_obat: "Obat Bebas",
  keterangan: "",
  referensi: "",
};


// =================================================================================
// KOMPONEN LAYOUT (Tidak ada perubahan signifikan, hanya untuk kelengkapan konteks)
// =================================================================================
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
      <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-white/20 p-6 shadow-xl flex-shrink-0">
        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-10 text-center">
          <img src="logo-kecil.png" alt="" />
        </div>
        <nav>
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li key={item.label} className="transform transition-all duration-200 hover:scale-105">
                <a
                  href={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${
                    activePage === item.label
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white"
                  }`}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
    </div>
  );
};

// =================================================================================
// SUB-KOMPONEN HALAMAN PRODUK (Diperbarui)
// =================================================================================

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-20 bg-white rounded-lg shadow-md">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
    <p className="mt-4 text-lg text-gray-600 font-semibold">Memuat data produk...</p>
  </div>
);

// --- Form Input Generic untuk mengurangi duplikasi ---
const FormInput = ({ id, label, value, onChange, type = "text", required = false, placeholder = "" }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={id} name={id} type={type} placeholder={placeholder || `Masukkan ${label.toLowerCase()}...`}
            value={value || ""} onChange={onChange} required={required}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
    </div>
);

const FormTextarea = ({ id, label, value, onChange, rows = 3, placeholder = "" }) => (
    <div className="md:col-span-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea
            id={id} name={id} value={value || ""} onChange={onChange} rows={rows}
            placeholder={placeholder || `Masukkan ${label.toLowerCase()}...`}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
    </div>
);

const FormSelect = ({ id, label, value, onChange, options }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <select
            id={id} name={id} value={value} onChange={onChange}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        >
            {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


// --- AddProductForm diperbarui untuk semua fields ---
const AddProductForm = ({ onAddProduct }) => {
  const [newProduct, setNewProduct] = useState(INITIAL_PRODUCT_STATE);
  const [showAllFields, setShowAllFields] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newProduct.nama_obat.trim() || !newProduct.harga_satuan || !newProduct.stok || !newProduct.satuan.trim()) {
      toast.error("Nama Obat, Harga, Stok, dan Satuan wajib diisi!");
      return;
    }

    const sanitizedPayload = { ...newProduct };

    for (const key in sanitizedPayload) {
      const value = sanitizedPayload[key];
      if (typeof value === 'string') {
        sanitizedPayload[key] = value.trim();
      }
    }

    sanitizedPayload.harga_satuan = parseInt(String(sanitizedPayload.harga_satuan).replace(/\D/g, ""), 10) || 0;
    sanitizedPayload.harga_grosir = parseInt(String(sanitizedPayload.harga_grosir).replace(/\D/g, ""), 10) || 0;
    sanitizedPayload.stok = parseInt(String(sanitizedPayload.stok).replace(/\D/g, ""), 10) || 0;
    
    const requiredFields = ['nama_obat', 'harga_satuan', 'stok', 'satuan', 'kategori', 'golongan_obat'];
    for (const key in sanitizedPayload) {
        if (!requiredFields.includes(key) && sanitizedPayload[key] === "") {
            sanitizedPayload[key] = null;
        }
    }

    onAddProduct(sanitizedPayload);
    setNewProduct(INITIAL_PRODUCT_STATE);
    setShowAllFields(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tambah Obat Baru</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
            <FormInput id="nama_obat" label="Nama Obat" value={newProduct.nama_obat} onChange={handleChange} required placeholder="Contoh: Paracetamol 500mg" />
        </div>
        <FormInput id="harga_satuan" label="Harga Satuan" value={newProduct.harga_satuan} onChange={handleChange} type="number" required placeholder="Contoh: 5000" />
        <FormInput id="harga_grosir" label="Harga Grosir (Opsional)" value={newProduct.harga_grosir} onChange={handleChange} type="number" placeholder="Contoh: 4500" />
        <FormInput id="stok" label="Stok" value={newProduct.stok} onChange={handleChange} type="number" required placeholder="Contoh: 100" />
        <FormInput id="satuan" label="Satuan" value={newProduct.satuan} onChange={handleChange} required placeholder="Contoh: Tablet / Botol" />
        <FormSelect id="kategori" label="Kategori" value={newProduct.kategori} onChange={handleChange} options={KATEGORI_OBAT.slice(1)} />
        <FormSelect id="golongan_obat" label="Golongan Obat" value={newProduct.golongan_obat} onChange={handleChange} options={GOLONGAN_OBAT} />
        <div className="lg:col-span-2">
           <FormInput id="foto" label="URL Foto" value={newProduct.foto} onChange={handleChange} type="url" placeholder="https://example.com/image.jpg" />
        </div>

        {!showAllFields && (
            <div className="col-span-full text-center mt-2">
                <button type="button" onClick={() => setShowAllFields(true)} className="text-blue-600 hover:underline font-medium">
                    Tampilkan Detail Lengkap...
                </button>
            </div>
        )}

        <AnimatePresence>
        {showAllFields && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <FormTextarea id="deskripsi" label="Deskripsi" value={newProduct.deskripsi} onChange={handleChange} />
                <FormTextarea id="manfaat" label="Manfaat" value={newProduct.manfaat} onChange={handleChange} />
                <FormTextarea id="komposisi" label="Komposisi" value={newProduct.komposisi} onChange={handleChange} />
                <FormTextarea id="perhatian" label="Perhatian" value={newProduct.perhatian} onChange={handleChange} />
                <FormTextarea id="efek_samping" label="Efek Samping" value={newProduct.efek_samping} onChange={handleChange} />
                <FormTextarea id="referensi" label="Referensi" value={newProduct.referensi} onChange={handleChange} />

                <FormInput id="dosis" label="Dosis" value={newProduct.dosis} onChange={handleChange} placeholder="3x sehari 1 tablet"/>
                <FormInput id="penyajian" label="Aturan Pakai / Penyajian" value={newProduct.penyajian} onChange={handleChange} placeholder="Sesudah makan"/>
                <FormInput id="cara_penyimpanan" label="Cara Penyimpanan" value={newProduct.cara_penyimpanan} onChange={handleChange} placeholder="Simpan di tempat sejuk"/>
                <FormInput id="kemasan" label="Kemasan" value={newProduct.kemasan} onChange={handleChange} placeholder="1 Strip @ 10 Tablet"/>
                <FormInput id="nomor_izin_edar" label="Nomor Izin Edar (NIE)" value={newProduct.nomor_izin_edar} onChange={handleChange} />
                <FormInput id="nama_standar_mims" label="Nama Standar MIMS" value={newProduct.nama_standar_mims} onChange={handleChange} />
                <div className="md:col-span-2">
                    <FormInput id="keterangan" label="Keterangan Tambahan" value={newProduct.keterangan} onChange={handleChange} />
                </div>
            </motion.div>
        )}
        </AnimatePresence>

        <button type="submit" className="col-span-full mt-2 bg-blue-600 text-white py-2.5 rounded-lg shadow hover:bg-blue-700 transition-colors duration-300 font-semibold">
          Tambah Obat
        </button>
      </form>
    </div>
  );
};


const ProductCard = ({ product, onEdit, onDelete, onUpdateStock }) => {
  const handleStockChange = (delta) => {
    const payload = {
      ...product,
      stok: Math.max(0, product.stok + delta),
    };
    delete payload.id; 
    onUpdateStock(product.id, payload);
  };

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow hover:shadow-2xl"
    >
      <img
        src={product.foto || "https://placehold.co/400x300/EEE/31343C?text=No+Image"}
        alt={product.nama_obat}
        className="w-full h-40 object-cover"
        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/EEE/31343C?text=Error"; }}
      />
      <div className="p-4 flex flex-col flex-grow">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full self-start mb-2 ${
            product.kategori === "Obat Keras" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
        }`}>
          {product.kategori || "Tidak ada kategori"}
        </span>
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{product.nama_obat}</h3>
        <p className="text-gray-600 text-sm mt-1 flex-grow line-clamp-3">
          {product.deskripsi || "Tidak ada deskripsi."}
        </p>
        <div className="mt-4">
          <p className="text-xl font-black text-green-600">
            Rp {product.harga_satuan.toLocaleString("id-ID")}
          </p>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <span className="font-semibold">Stok:</span>
            <div className="flex items-center gap-2">
              <button onClick={() => handleStockChange(-1)} disabled={product.stok <= 0} className="text-red-500 disabled:text-gray-300 hover:text-red-700 transition-colors">
                <FiMinusCircle size={20} />
              </button>
              <span className={`font-bold text-lg ${
                  product.stok < 10 && product.stok > 0 ? "text-orange-500"
                  : product.stok === 0 ? "text-red-600"
                  : "text-gray-700"
              }`}>
                {product.stok} <span className="text-xs font-normal">{product.satuan}</span>
              </span>
              <button onClick={() => handleStockChange(1)} className="text-green-500 hover:text-green-700 transition-colors">
                <FiPlusCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t">
        <button onClick={() => onEdit(product)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors" title="Edit Produk">
          <FiEdit size={18} />
        </button>
        <button onClick={() => onDelete(product.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Hapus Produk">
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
          <p className="mt-2">Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} onUpdateStock={onUpdateStock} />
          ))}
        </AnimatePresence>
      </div>
    );
  };


const EditProductModal = ({ product, onClose, onSave }) => {
  const [editedProduct, setEditedProduct] = useState({ ...INITIAL_PRODUCT_STATE, ...product });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...editedProduct,
      harga_satuan: parseInt(String(editedProduct.harga_satuan).replace(/\D/g, ""), 10) || 0,
      harga_grosir: parseInt(String(editedProduct.harga_grosir).replace(/\D/g, ""), 10) || 0,
      stok: parseInt(String(editedProduct.stok).replace(/\D/g, ""), 10) || 0,
    };
    delete payload.id;
    onSave(product.id, payload);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-semibold mb-6">Edit Produk: <span className="font-bold">{product.nama_obat}</span></h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
                <FormInput id="nama_obat" label="Nama Obat" value={editedProduct.nama_obat} onChange={handleChange} required />
            </div>
            <FormInput id="harga_satuan" label="Harga Satuan" value={editedProduct.harga_satuan} onChange={handleChange} type="number" required />
            <FormInput id="harga_grosir" label="Harga Grosir" value={editedProduct.harga_grosir || ''} onChange={handleChange} type="number" />
            <FormInput id="stok" label="Stok" value={editedProduct.stok} onChange={handleChange} type="number" required />
            <FormInput id="satuan" label="Satuan" value={editedProduct.satuan} onChange={handleChange} required />
            <FormSelect id="kategori" label="Kategori" value={editedProduct.kategori} onChange={handleChange} options={KATEGORI_OBAT.slice(1)} />
            <FormSelect id="golongan_obat" label="Golongan Obat" value={editedProduct.golongan_obat} onChange={handleChange} options={GOLONGAN_OBAT} />
            <div className="lg:col-span-2">
                <FormInput id="foto" label="URL Foto" value={editedProduct.foto} onChange={handleChange} type="url" />
            </div>

            <hr className="col-span-full my-2"/>

            <FormTextarea id="deskripsi" label="Deskripsi" value={editedProduct.deskripsi} onChange={handleChange} />
            <FormTextarea id="manfaat" label="Manfaat" value={editedProduct.manfaat} onChange={handleChange} />
            <FormTextarea id="komposisi" label="Komposisi" value={editedProduct.komposisi} onChange={handleChange} />
            <FormTextarea id="perhatian" label="Perhatian" value={editedProduct.perhatian} onChange={handleChange} />
            <FormTextarea id="efek_samping" label="Efek Samping" value={editedProduct.efek_samping} onChange={handleChange} />
            <FormTextarea id="referensi" label="Referensi" value={editedProduct.referensi} onChange={handleChange} />
            
            <FormInput id="dosis" label="Dosis" value={editedProduct.dosis} onChange={handleChange} />
            <FormInput id="penyajian" label="Penyajian" value={editedProduct.penyajian} onChange={handleChange} />
            <FormInput id="cara_penyimpanan" label="Cara Penyimpanan" value={editedProduct.cara_penyimpanan} onChange={handleChange} />
            <FormInput id="kemasan" label="Kemasan" value={editedProduct.kemasan} onChange={handleChange} />
            <FormInput id="nomor_izin_edar" label="Nomor Izin Edar" value={editedProduct.nomor_izin_edar} onChange={handleChange} />
            <FormInput id="nama_standar_mims" label="Nama Standar MIMS" value={editedProduct.nama_standar_mims} onChange={handleChange} />
            <div className="md:col-span-2">
                <FormInput id="keterangan" label="Keterangan Tambahan" value={editedProduct.keterangan} onChange={handleChange} />
            </div>
            
            <div className="col-span-full flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors">Batal</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors">Simpan Perubahan</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


// =================================================================================
// KOMPONEN UTAMA HALAMAN PRODUK
// =================================================================================
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
        nama_obat: item.nama_obat || "Nama Tidak Tersedia",
        harga_satuan: parseInt(item.harga_satuan, 10) || 0,
        harga_grosir: parseInt(item.harga_grosir, 10) || 0,
        stok: parseInt(item.stok, 10) || 0,
        foto: item.foto,
        satuan: item.satuan,
        deskripsi: item.deskripsi,
        komposisi: item.komposisi,
        kemasan: item.kemasan,
        manfaat: item.manfaat,
        kategori: item.kategori,
        dosis: item.dosis,
        penyajian: item.penyajian,
        cara_penyimpanan: item.cara_penyimpanan,
        perhatian: item.perhatian,
        efek_samping: item.efek_samping,
        nama_standar_mims: item.nama_standar_mims,
        nomor_izin_edar: item.nomor_izin_edar,
        golongan_obat: item.golongan_obat,
        keterangan: item.keterangan,
        referensi: item.referensi,
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
      const errResponse = await error.response?.json();
      const message = errResponse?.message || error.message || errorMessage;
      toast.error(message, { id: toastId });
    }
  };

  const addProduct = async (newProduct) => {
    await handleApiCall(
      async () => {
        const response = await fetch(`${API_BASE_URL}/obat`, {
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
                    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
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
        product.nama_obat.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((product) =>
        filterCategory === "Semua Kategori" ? true : product.kategori === filterCategory
      );
  }, [products, searchTerm, filterCategory]);

  return (
    <div className="max-w-screen-2xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Manajemen Produk</h1>
        <a href="/stok-opname" className="bg-green-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 font-semibold">
          Stok Opname
        </a>
      </header>

      <AddProductForm onAddProduct={addProduct} />

      <div className="bg-white shadow-md rounded-lg p-4 my-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Cari nama obat..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 pl-10 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
          />
        </div>
        <select
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full md:w-1/2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
        >
          {KATEGORI_OBAT.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ProductList products={filteredProducts} onEdit={setEditingProduct} onDelete={deleteProduct} onUpdateStock={updateProduct} />
      )}
      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={updateProduct} />
      )}
    </div>
  );
};

// =================================================================================
// KOMPONEN EXPORT UTAMA
// =================================================================================
const ProductManagementPage = () => {
  return (
    <Layout activePage="Produk">
      <ProductManagementContent />
    </Layout>
  );
};

export default ProductManagementPage;