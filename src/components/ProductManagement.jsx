// Versi lengkap dengan popup modal edit produk
import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/obat`;

const KATEGORI_OBAT = [
  "Obat Resep",
  "Obat Bebas",
  "Vitamin & Suplemen",
  "Perawatan Pribadi",
];

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    nama_obat: "",
    deskripsi: "",
    dosis: "",
    harga_satuan: "",
    harga_grosir: "",
    stok: "",
    kategori: "Obat Bebas",
    foto: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
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
      alert("Gagal mengambil data dari server");
    }
    setLoading(false);
  };

  const handleStockChange = (id, delta) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(p.stock + delta, 0) } : p
      )
    );
  };

  const updateProductAPI = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Gagal memperbarui data obat");
      return await response.json();
    } catch (error) {
      console.error(error);
      alert("Gagal update data obat");
    }
  };

  const addProductAPI = async () => {
    try {
      const payload = {
        ...newProduct,
        harga_satuan: parseInt(newProduct.harga_satuan) || 0,
        harga_grosir: parseInt(newProduct.harga_grosir) || 0,
        stok: parseInt(newProduct.stok) || 0,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Gagal menambahkan obat baru");

      const data = await response.json();
      setProducts((prev) => [
        ...prev,
        {
          id: data.obat_id,
          name: payload.nama_obat,
          description: payload.deskripsi,
          dosis: payload.dosis,
          price: payload.harga_satuan,
          harga_grosir: payload.harga_grosir,
          stock: payload.stok,
          kategori: payload.kategori,
          foto: payload.foto,
        },
      ]);

      setNewProduct({
        nama_obat: "",
        deskripsi: "",
        dosis: "",
        harga_satuan: "",
        harga_grosir: "",
        stok: "",
        kategori: "Obat Bebas",
        foto: "",
      });
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan obat");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Produk Apotek</h1>
        <a
          href="/stok-opname"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Stok Opname
        </a>
      </div>

      <div className="bg-white shadow rounded p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Tambah Obat Baru</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addProductAPI();
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[
            "nama_obat",
            "deskripsi",
            "dosis",
            "harga_satuan",
            "harga_grosir",
            "stok",
            "foto",
          ].map((key) => (
            <input
              key={key}
              type="text"
              placeholder={key.replace("_", " ").toUpperCase()}
              value={newProduct[key]}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  [key]:
                    key.includes("harga") || key === "stok"
                      ? e.target.value.replace(/\D/g, "")
                      : e.target.value,
                })
              }
              className="border border-gray-300 rounded p-2"
            />
          ))}
          <select
            value={newProduct.kategori}
            onChange={(e) =>
              setNewProduct({ ...newProduct, kategori: e.target.value })
            }
            className="border border-gray-300 rounded p-2"
          >
            {KATEGORI_OBAT.map((kategori) => (
              <option key={kategori} value={kategori}>
                {kategori}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Tambah Obat
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Memuat data...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Foto</th>
                <th className="p-2">Nama</th>
                <th className="p-2">Stok</th>
                <th className="p-2">Harga</th>
                <th className="p-2">Kategori</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="text-center border-t">
                  <td className="p-2">
                    {prod.foto ? (
                      <img
                        src={prod.foto}
                        alt="foto obat"
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2 font-medium">{prod.name}</td>
                  <td className="p-2">
                    {prod.stock}
                    <button
                      onClick={() => handleStockChange(prod.id, +1)}
                      className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleStockChange(prod.id, -1)}
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                      disabled={prod.stock === 0}
                    >
                      -
                    </button>
                  </td>
                  <td className="p-2">Rp {prod.price.toLocaleString()}</td>
                  <td className="p-2">{prod.kategori}</td>
                  <td className="p-2">
                    <button
                      onClick={() => setEditingProduct(prod)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              Edit Produk: {editingProduct.name}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const updatedData = {
                  nama_obat: editingProduct.name,
                  deskripsi: editingProduct.description,
                  dosis: editingProduct.dosis,
                  harga_satuan: editingProduct.price,
                  harga_grosir: editingProduct.harga_grosir,
                  stok: editingProduct.stock,
                  kategori: editingProduct.kategori,
                  foto: editingProduct.foto,
                };
                await updateProductAPI(editingProduct.id, updatedData);
                setEditingProduct(null);
                fetchProducts();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
                className="border p-2 rounded"
                placeholder="Nama Obat"
              />
              <input
                type="text"
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                className="border p-2 rounded"
                placeholder="Deskripsi"
              />
              <input
                type="text"
                value={editingProduct.dosis}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    dosis: e.target.value,
                  })
                }
                className="border p-2 rounded"
                placeholder="Dosis"
              />
              <input
                type="text"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: parseInt(e.target.value) || 0,
                  })
                }
                className="border p-2 rounded"
                placeholder="Harga Satuan"
              />
              <input
                type="text"
                value={editingProduct.harga_grosir}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    harga_grosir: parseInt(e.target.value) || 0,
                  })
                }
                className="border p-2 rounded"
                placeholder="Harga Grosir"
              />
              <input
                type="text"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                className="border p-2 rounded"
                placeholder="Stok"
              />
              <select
                value={editingProduct.kategori}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    kategori: e.target.value,
                  })
                }
                className="border p-2 rounded"
              >
                {KATEGORI_OBAT.map((kategori) => (
                  <option key={kategori} value={kategori}>
                    {kategori}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={editingProduct.foto}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, foto: e.target.value })
                }
                className="border p-2 rounded"
                placeholder="Foto URL"
              />
              <div className="col-span-full flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
