import React, { useState, useEffect } from "react";

const StockOpname = () => {
  const navigate = () => {
    // Simulasi navigasi - dalam implementasi nyata gunakan react-router
    console.log("Navigating to /produk");
  };
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, discrepancy, counted, uncounted
  const [isLoading, setIsLoading] = useState(false);

  // Sample data - dalam implementasi nyata, ini akan diambil dari API
  const sampleProducts = [
    {
      id: 1,
      kode: "OBT001",
      nama: "Paracetamol 500mg",
      kategori: "Analgesik",
      satuan: "Strip",
      stokSistem: 150,
      stokFisik: null,
      sudahDihitung: false,
      selisih: 0,
      keterangan: ""
    },
    {
      id: 2,
      kode: "OBT002", 
      nama: "Amoxicillin 250mg",
      kategori: "Antibiotik",
      satuan: "Kapsul",
      stokSistem: 200,
      stokFisik: 195,
      sudahDihitung: true,
      selisih: -5,
      keterangan: "Kemasan rusak"
    },
    {
      id: 3,
      kode: "OBT003",
      nama: "Vitamin C 1000mg",
      kategori: "Vitamin",
      satuan: "Tablet",
      stokSistem: 80,
      stokFisik: 85,
      sudahDihitung: true,
      selisih: 5,
      keterangan: ""
    },
    {
      id: 4,
      kode: "OBT004",
      nama: "Ibuprofen 400mg",
      kategori: "Analgesik",
      satuan: "Tablet",
      stokSistem: 120,
      stokFisik: null,
      sudahDihitung: false,
      selisih: 0,
      keterangan: ""
    }
  ];

  useEffect(() => {
    // Simulasi loading data
    setIsLoading(true);
    setTimeout(() => {
      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => 
      product.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.kode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch(filter) {
      case "discrepancy":
        filtered = filtered.filter(p => p.sudahDihitung && p.selisih !== 0);
        break;
      case "counted":
        filtered = filtered.filter(p => p.sudahDihitung);
        break;
      case "uncounted":
        filtered = filtered.filter(p => !p.sudahDihitung);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filter, products]);

  const handleStokFisikChange = (id, value) => {
    const updatedProducts = products.map(product => {
      if (product.id === id) {
        const stokFisik = parseInt(value) || 0;
        const selisih = stokFisik - product.stokSistem;
        return {
          ...product,
          stokFisik,
          selisih,
          sudahDihitung: true
        };
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const handleKeteranganChange = (id, value) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, keterangan: value } : product
    );
    setProducts(updatedProducts);
  };

  const resetProduct = (id) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { 
        ...product, 
        stokFisik: null, 
        sudahDihitung: false, 
        selisih: 0,
        keterangan: ""
      } : product
    );
    setProducts(updatedProducts);
  };

  const getStatusBadge = (product) => {
    if (!product.sudahDihitung) {
      return <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">Belum Dihitung</span>;
    }
    
    if (product.selisih === 0) {
      return <span className="px-2 py-1 bg-green-200 text-green-700 rounded-full text-xs">Sesuai</span>;
    } else if (product.selisih > 0) {
      return <span className="px-2 py-1 bg-blue-200 text-blue-700 rounded-full text-xs">Lebih</span>;
    } else {
      return <span className="px-2 py-1 bg-red-200 text-red-700 rounded-full text-xs">Kurang</span>;
    }
  };

  const getStats = () => {
    const total = products.length;
    const counted = products.filter(p => p.sudahDihitung).length;
    const discrepancy = products.filter(p => p.sudahDihitung && p.selisih !== 0).length;
    return { total, counted, uncounted: total - counted, discrepancy };
  };

  const stats = getStats();

  const saveOpname = () => {
    const uncountedProducts = products.filter(p => !p.sudahDihitung);
    if (uncountedProducts.length > 0) {
      alert(`Masih ada ${uncountedProducts.length} produk yang belum dihitung!`);
      return;
    }
    
    // Simulasi save
    alert("Data stok opname berhasil disimpan!");
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Memuat data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Stok Opname Obat</h1>
        <p className="text-gray-600">Cocokkan stok fisik dengan stok di sistem untuk memastikan akurasi inventory</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800">Total Produk</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-800">Sudah Dihitung</h3>
          <p className="text-2xl font-bold text-green-900">{stats.counted}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-800">Belum Dihitung</h3>
          <p className="text-2xl font-bold text-yellow-900">{stats.uncounted}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-sm font-medium text-red-800">Ada Selisih</h3>
          <p className="text-2xl font-bold text-red-900">{stats.discrepancy}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <input
              type="text"
              placeholder="Cari produk atau kode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Produk</option>
              <option value="uncounted">Belum Dihitung</option>
              <option value="counted">Sudah Dihitung</option>
              <option value="discrepancy">Ada Selisih</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/produk")}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={saveOpname}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Simpan Opname
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kode</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama Produk</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kategori</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Stok Sistem</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Stok Fisik</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Selisih</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Keterangan</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.kode}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.nama}</div>
                      <div className="text-sm text-gray-500">{product.satuan}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.kategori}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">{product.stokSistem}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="0"
                      value={product.stokFisik || ""}
                      onChange={(e) => handleStokFisikChange(product.id, e.target.value)}
                      className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-medium ${
                      product.selisih === 0 ? 'text-gray-700' :
                      product.selisih > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {product.sudahDihitung ? (product.selisih > 0 ? `+${product.selisih}` : product.selisih) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(product)}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={product.keterangan}
                      onChange={(e) => handleKeteranganChange(product.id, e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Keterangan..."
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => resetProduct(product.id)}
                      className="text-red-600 hover:text-red-800 text-sm underline"
                      title="Reset perhitungan"
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada produk yang ditemukan
          </div>
        )}
      </div>

      {/* Progress Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800">Progress Stok Opname</span>
          <span className="text-sm text-blue-700">{stats.counted}/{stats.total} produk</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stats.counted / stats.total) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          {stats.uncounted > 0 
            ? `Masih ada ${stats.uncounted} produk yang belum dihitung`
            : "Semua produk sudah dihitung!"
          }
        </p>
      </div>
    </div>
  );
};

export default StockOpname;