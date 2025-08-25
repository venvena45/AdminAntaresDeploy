import React, { useEffect, useState, useCallback } from "react";

// =================================================================================
// KOMPONEN LAYOUT BERSAMA (SHARED LAYOUT COMPONENT)
// =================================================================================
// Komponen Layout yang sama kita gunakan kembali di sini untuk konsistensi.
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
              <li
                key={item.label}
                className="transform transition-all duration-200 hover:scale-105"
              >
                <a
                  href={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer
                    ${
                      activePage === item.label
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white"
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
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
    </div>
  );
};

// =================================================================================
// KONTEN HALAMAN PEMESANAN (ORDER CONTENT)
// =================================================================================
// Kode asli Anda untuk halaman pesanan, diubah menjadi komponen konten.

// --- Konstanta API ---
const API_BASE_URL = "https://apotekantares.my.id/api";

// --- Fungsi Helper untuk API ---
const getAllPesanan = async () => {
  const response = await fetch(`${API_BASE_URL}/pesanan`);
  if (!response.ok)
    throw new Error(
      `Gagal mengambil daftar pesanan. Status: ${response.status}`
    );
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
};

const getDetailPesananById = async (pesananId) => {
  if (!pesananId) return [];
  const response = await fetch(
    `${API_BASE_URL}/detail-pesanan/${pesananId}`
  );
  if (!response.ok) {
    console.warn(
      `Gagal mengambil detail untuk pesanan ID ${pesananId}. Mungkin tidak ada item.`
    );
    return [];
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const getAllObat = async () => {
  const response = await fetch(`${API_BASE_URL}/obat`);
  if (!response.ok) {
    console.warn(`Gagal mengambil data obat.`);
    return [];
  }
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
};

const getUserById = async (userId) => {
  if (!userId) return null;
  const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`);
  if (!response.ok) {
    console.warn(`FETCH GAGAL untuk User ID: ${userId}.`);
    return {
      id_pasti: userId,
      nama: `[Gagal Muat User ID: ${userId}]`,
      alamat: "N/A",
    };
  }
  const responseData = await response.json();
  if (responseData && responseData.user) {
    return { ...responseData.user, id_pasti: userId };
  } else {
    console.warn(
      `Struktur data pengguna untuk ID ${userId} tidak sesuai ekspektasi.`
    );
    return { id_pasti: userId, nama: `[Struktur Data Salah]`, alamat: "N/A" };
  }
};

const updateOrderStatus = async (pesananId, payload) => {
  const response = await fetch(`${API_BASE_URL}/pesanan/${pesananId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gagal memperbarui status pesanan. Server merespons: ${errorBody}`
    );
  }

  return await response.json();
};

const PesananContent = () => {
  const [pesanan, setPesanan] = useState([]);
  const [rawPesanan, setRawPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("semua");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [pesananUtamaList, semuaObatList] = await Promise.all([
        getAllPesanan(),
        getAllObat(),
      ]);

      setRawPesanan(pesananUtamaList);

      const obatMap = new Map(
        semuaObatList.map((obat) => [String(obat.obat_id).trim(), obat])
      );

      const transformedDataPromises = pesananUtamaList.map(
        async (pesananItem) => {
          const pelangganIdStr = String(pesananItem.pelanggan_id).trim();
          const [userData, detailItems] = await Promise.all([
            getUserById(pelangganIdStr),
            getDetailPesananById(pesananItem.pesanan_id),
          ]);

          return {
            id: pesananItem.pesanan_id,
            namaPembeli:
              userData?.nama || `[ID: ${pelangganIdStr} tidak cocok]`,
            alamat:
              pesananItem.alamat_pengiriman ||
              userData?.alamat ||
              "Alamat tidak tersedia",
            obat: detailItems.map((d) => {
              const obatData = obatMap.get(String(d.obat_id).trim());
              return {
                nama: obatData?.nama_obat || `Obat ID: ${d.obat_id}`,
                jumlah: d.jumlah,
              };
            }),
            totalHarga: pesananItem.total_harga,
            status: pesananItem.status_pesanan,
            tanggal: new Date(pesananItem.tanggal_pesan).toLocaleDateString(
              "id-ID",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            ),
          };
        }
      );

      const finalData = await Promise.all(transformedDataPromises);
      setPesanan(finalData.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Terjadi kesalahan fatal saat memuat data pesanan:", err);
      setError(`Gagal memuat data. Detail: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (pesananId, newStatus) => {
    const orderToUpdate = rawPesanan.find((p) => p.pesanan_id === pesananId);

    if (!orderToUpdate) {
      console.error("Data pesanan asli tidak ditemukan untuk ID:", pesananId);
      alert("Gagal memperbarui: Data asli tidak ditemukan.");
      return;
    }

    const payload = {
      pelanggan_id: orderToUpdate.pelanggan_id,
      tanggal_pesan: orderToUpdate.tanggal_pesan.split("T")[0],
      total_harga: orderToUpdate.total_harga,
      status_pesanan: newStatus,
      metode_pembayaran: orderToUpdate.metode_pembayaran,
      alamat_pengiriman: orderToUpdate.alamat_pengiriman,
    };

    try {
      await updateOrderStatus(pesananId, payload);
      setPesanan((prevPesanan) =>
        prevPesanan.map((p) =>
          p.id === pesananId ? { ...p, status: newStatus } : p
        )
      );
    } catch (err) {
      console.error(`Gagal mengubah status untuk pesanan ${pesananId}:`, err);
      alert(`Gagal memperbarui status: ${err.message}`);
    }
  };

  const filteredPesanan = pesanan.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      item.namaPembeli.toLowerCase().includes(searchLower) ||
      item.alamat.toLowerCase().includes(searchLower) ||
      item.obat.some((o) => o.nama.toLowerCase().includes(searchLower));
    const matchFilter =
      filter === "semua" || item.status.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "menunggu":
        return "bg-yellow-100 text-yellow-800";
      case "diproses":
        return "bg-blue-100 text-blue-800";
      case "dikirim":
        return "bg-purple-100 text-purple-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      case "dibatalkan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "semua":
        return "📂";
      case "menunggu":
        return "⏱️";
      case "diproses":
        return "📦";
      case "dikirim":
        return "🚚";
      case "selesai":
        return "✅";
      case "dibatalkan":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] text-gray-600">
        <svg
          className="animate-spin h-8 w-8 text-blue-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="font-semibold">
          Mengambil dan Menggabungkan Data Pesanan...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] text-center p-4">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-red-700">Terjadi Kesalahan</h2>
        <p className="max-w-md text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    // Div ini menjadi wrapper untuk konten di dalam <main>
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Daftar Pesanan Masuk
        </h1>
        <div className="relative w-full sm:w-72">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari nama, alamat, atau obat..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          "semua",
          "menunggu",
          "diproses",
          "dikirim",
          "selesai",
          "dibatalkan",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
              filter === status
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-500 hover:text-blue-600"
            }`}
          >
            {getStatusIcon(status)}{" "}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      {filteredPesanan.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="text-xl font-semibold text-gray-800">
            Tidak Ada Pesanan Ditemukan
          </h3>
          <p className="text-gray-500 mt-2">
            Coba ubah filter atau kata kunci pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "ID Pesanan",
                  "Pelanggan",
                  "Detail Pesanan",
                  "Total Harga",
                  "Status",
                  "Aksi",
                ].map((th) => (
                  <th
                    key={th}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPesanan.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      #{item.id}
                    </div>
                    <div className="text-xs text-gray-500">{item.tanggal}</div>
                  </td>
                  <td className="px-6 py-4 align-top max-w-[200px]">
                    <div className="text-sm font-medium text-gray-900">
                      {item.namaPembeli}
                    </div>
                    <div className="text-xs text-gray-600 break-words">
                      {item.alamat}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                      {item.obat.length > 0 ? (
                        item.obat.map((obat, idx) => (
                          <li key={idx}>
                            {obat.nama}{" "}
                            <span className="font-semibold">
                              (x{obat.jumlah || "?"})
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="list-none text-gray-500 italic">
                          Tidak ada item
                        </li>
                      )}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    Rp{item.totalHarga.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)} {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.status.toLowerCase() === "diproses" && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, "dikirim")}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out shadow-sm flex items-center gap-2"
                      >
                        🚚 Kirim Pesanan
                      </button>
                    )}
                    {item.status.toLowerCase() === "dikirim" && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, "selesai")}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out shadow-sm flex items-center gap-2"
                      >
                        ✅ Selesaikan Pesanan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// =================================================================================
// KOMPONEN EXPORT UTAMA (MAIN EXPORTED COMPONENT)
// =================================================================================
// Ini adalah komponen final yang menggabungkan Layout dan Konten.

const HalamanPesanan = () => {
  return (
    <Layout activePage="Pemesanan">
      <PesananContent />
    </Layout>
  );
};

export default HalamanPesanan;
