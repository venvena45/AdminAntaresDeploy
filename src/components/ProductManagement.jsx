import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/obat`;

// Opsi untuk dropdown kategori obat
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
    kategori: "Obat Bebas", // Default value
    foto: "",
  });

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
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
      })
      .catch((err) => {
        console.error("Gagal mengambil data:", err);
        alert("Gagal mengambil data dari server");
      });
  }, []);

  const updateProduct = (id, newData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...newData } : p))
    );
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal menambahkan obat baru");

      const data = await response.json();
      setProducts([
        ...products,
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
        kategori: "Obat Bebas", // Reset to default value
        foto: "",
      });
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan obat");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-6">Manajemen Produk Apotek</h1>
        <a
          href="/stok-opname"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Stok Opname
        </a>
      </div>
      <h2 className="text-xl font-semibold mb-2">Tambah Obat Baru</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addProductAPI();
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        <input
          type="text"
          placeholder="Nama Obat"
          value={newProduct.nama_obat}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              nama_obat: e.target.value,
            })
          }
          required
          className="border border-gray-300 rounded p-2"
        />
        <input
          type="text"
          placeholder="Deskripsi"
          value={newProduct.deskripsi}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              deskripsi: e.target.value,
            })
          }
          required
          className="border border-gray-300 rounded p-2"
        />
        <input
          type="text"
          placeholder="Dosis"
          value={newProduct.dosis}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              dosis: e.target.value,
            })
          }
          className="border border-gray-300 rounded p-2"
        />
        <input
          type="text"
          placeholder="Harga Satuan"
          value={newProduct.harga_satuan}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              harga_satuan: e.target.value.replace(/\D/g, ""),
            })
          }
          className="border border-gray-300 rounded p-2"
        />
        <input
          type="text"
          placeholder="Harga Grosir"
          value={newProduct.harga_grosir}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              harga_grosir: e.target.value.replace(/\D/g, ""),
            })
          }
          className="border border-gray-300 rounded p-2"
        />
        <input
          type="text"
          placeholder="Stok"
          value={newProduct.stok}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              stok: e.target.value.replace(/\D/g, ""),
            })
          }
          className="border border-gray-300 rounded p-2"
        />
        <select
          value={newProduct.kategori}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              kategori: e.target.value,
            })
          }
          className="border border-gray-300 rounded p-2"
        >
          {KATEGORI_OBAT.map((kategori) => (
            <option key={kategori} value={kategori}>
              {kategori}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="URL Foto"
          value={newProduct.foto}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              foto: e.target.value,
            })
          }
          className="border border-gray-300 rounded p-2"
        />
        <button
          type="submit"
          className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Tambah Obat
        </button>
      </form>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Nama Obat</th>
            <th className="border px-4 py-2">Stok</th>
            <th className="border px-4 py-2">Harga (Rp)</th>
            <th className="border px-4 py-2">Kategori</th>
            <th className="border px-4 py-2">Deskripsi</th>
            <th className="border px-4 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id} className="text-center">
              <td className="border px-4 py-2">{prod.name}</td>
              <td className="border px-4 py-2">
                {prod.stock}{" "}
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
              <td className="border px-4 py-2">{prod.price}</td>
              <td className="border px-4 py-2">{prod.kategori}</td>
              <td className="border px-4 py-2">{prod.description}</td>
              <td className="border px-4 py-2">
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
      {editingProduct && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">
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
              updateProduct(editingProduct.id, editingProduct);
              setEditingProduct(null);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <label className="block">
              <span className="text-sm font-medium">Harga Satuan:</span>
              <input
                type="text"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Harga Grosir:</span>
              <input
                type="text"
                value={editingProduct.harga_grosir}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    harga_grosir: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Stok:</span>
              <input
                type="text"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Kategori:</span>
              <select
                value={editingProduct.kategori}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    kategori: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              >
                {KATEGORI_OBAT.map((kategori) => (
                  <option key={kategori} value={kategori}>
                    {kategori}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Deskripsi:</span>
              <input
                type="text"
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Dosis:</span>
              <input
                type="text"
                value={editingProduct.dosis}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    dosis: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Foto URL:</span>
              <input
                type="text"
                value={editingProduct.foto}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    foto: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />
            </label>
            <div className="col-span-full flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
