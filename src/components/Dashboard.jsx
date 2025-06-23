import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // State untuk menyimpan daftar 5 pesanan teratas
  const [topOrders, setTopOrders] = useState([]);
  // State untuk melacak status loading pesanan
  const [loadingOrders, setLoadingOrders] = useState(true);
  // State untuk error jika fetch API pesanan gagal
  const [ordersError, setOrdersError] = useState(null);
  // State baru untuk menyimpan total penjualan
  const [totalSales, setTotalSales] = useState(0);

  // Fungsi untuk mendapatkan kelas Tailwind CSS berdasarkan status
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "menunggu":
        return "bg-yellow-100 text-yellow-700";
      case "diproses":
        return "bg-blue-100 text-blue-700";
      case "dikirim":
        return "bg-purple-100 text-purple-700";
      case "selesai":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Efek untuk memuat data pesanan dari API saat komponen pertama kali dimuat
  useEffect(() => {
    const API_BASE_URL = "https://antaresapi-production.up.railway.app/api";
    const API_ENDPOINT = `${API_BASE_URL}/pesanan`;

    const fetchOrders = async () => {
      setLoadingOrders(true); // Mulai loading
      setOrdersError(null); // Reset error
      try {
        console.log(
          "Dashboard: Mencoba mengambil data pesanan dari:",
          API_ENDPOINT
        );
        const res = await fetch(API_ENDPOINT);

        if (!res.ok) {
          // Tangani respon yang tidak berhasil
          const errorText = await res.text();
          throw new Error(
            `HTTP error! status: ${res.status}, detail: ${errorText}`
          );
        }

        const rawData = await res.json();
        console.log("Dashboard: 📦 Respons mentah dari API /pesanan:", rawData);

        let dataToProcess = [];
        // Menangani format respons yang mungkin berbeda (array langsung atau objek dengan properti 'data')
        if (Array.isArray(rawData)) {
          dataToProcess = rawData;
        } else if (rawData && Array.isArray(rawData.data)) {
          dataToProcess = rawData.data;
        } else {
          console.warn(
            "Dashboard: Format respons API tidak sesuai ekspektasi (bukan array langsung atau objek dengan properti 'data' berupa array). Menganggap tidak ada data."
          );
          setTopOrders([]);
          setTotalSales(0); // Set total penjualan ke 0 jika tidak ada data
          setLoadingOrders(false);
          return;
        }

        // Hitung total penjualan dari semua pesanan
        // Pastikan item.total_harga adalah angka sebelum dijumlahkan
        const calculatedTotalSales = dataToProcess.reduce(
          (sum, item) => sum + (Number(item.total_harga) || 0),
          0
        );
        setTotalSales(calculatedTotalSales);

        // Urutkan pesanan berdasarkan tanggal (terbaru ke terlama) dan ambil 5 teratas
        const sortedAndLimitedOrders = dataToProcess
          .sort((a, b) => new Date(b.tanggal_pesan) - new Date(a.tanggal_pesan))
          .slice(0, 5); // Ambil hanya 5 pesanan teratas

        // Transformasi data agar sesuai dengan struktur tabel Dashboard
        const transformedOrders = sortedAndLimitedOrders.map((item) => ({
          order: item.pesanan_id,
          name: `Pelanggan ID: ${item.pelanggan_id || "N/A"}`, // Menggunakan ID pelanggan jika nama pembeli tidak tersedia
          date: new Date(item.tanggal_pesan).toLocaleDateString("id-ID", {
            // Format tanggal
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          status: item.status_pesanan,
          place: "Tidak Tersedia", // Placeholder karena alamat tidak ada di respons API ini
          total: `Rp ${Number(item.total_harga || 0).toLocaleString("id-ID")}`, // Pastikan angka sebelum format
        }));

        setTopOrders(transformedOrders);
        console.log(
          "Dashboard: ✅ 5 Pesanan teratas setelah transformasi:",
          transformedOrders
        );
        console.log(
          "Dashboard: ✅ Total Penjualan Dihitung:",
          calculatedTotalSales
        );
      } catch (err) {
        console.error(
          "Dashboard: Gagal memuat pesanan atau menghitung total penjualan:",
          err
        );
        setOrdersError(
          `Gagal memuat data. Ini mungkin masalah CORS atau API tidak aktif. Detail: ${err.message}`
        );
        setTotalSales(0); // Reset total penjualan jika ada error
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []); // Efek ini hanya berjalan sekali saat komponen di-mount

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 p-5">
        <div className="text-2xl font-bold text-green-700 mb-10">
          Apotek ANTARES
        </div>
        <nav>
          <ul className="space-y-4 text-gray-700">
            <li>
              <Link to="/pesanan" className="hover:underline">
                Pemesanan
              </Link>
            </li>
            <li>
              <Link to="/produk" className="hover:underline">
                Produk
              </Link>
            </li>
            <li>
              <Link to="/report" className="hover:underline">
                Report Penjualan
              </Link>
            </li>

            <li>
              <Link to="/pengaturan" className="hover:underline">
                Pengaturan
              </Link>
            </li>

            <li>
              <Link to="/keluar" className="hover:underline">
                Keluar
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Analisa</h1>
          <input
            type="text"
            placeholder="Pencarian"
            className="w-64 px-3 py-2 border border-gray-300 rounded-md"
          />
          <div className="text-right">
            <div className="text-gray-800 font-medium">Yuzar</div>
            <div className="text-sm text-gray-500">Admin</div>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="flex flex-wrap gap-6 mb-10">
          <div className="flex items-center gap-4 bg-red-100 p-5 rounded-lg flex-1 min-w-[250px]">
            <div className="text-3xl">📊</div>
            <div>
              {loadingOrders ? (
                <p className="text-lg font-semibold text-gray-600">Memuat...</p>
              ) : ordersError ? (
                <p className="text-lg font-semibold text-red-600">Error</p>
              ) : (
                <p className="text-lg font-semibold">
                  Rp. {totalSales.toLocaleString("id-ID")}
                </p>
              )}
              <small className="text-gray-600">Total Penjualan</small>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-yellow-100 p-5 rounded-lg flex-1 min-w-[250px]">
            <div className="text-3xl">📦</div>
            <div>
              {loadingOrders ? (
                <p className="text-lg font-semibold text-gray-600">Memuat...</p>
              ) : ordersError ? (
                <p className="text-lg font-semibold text-red-600">Error</p>
              ) : (
                <p className="text-lg font-semibold">
                  {topOrders.length > 0 ? topOrders.length : 0}
                </p> // Menggunakan jumlah pesanan yang diambil untuk 5 teratas
              )}
              <small className="text-gray-600">Total Pesanan</small>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-green-100 p-5 rounded-lg flex-1 min-w-[250px]">
            <div className="text-3xl">💊</div>
            <div>
              <p className="text-lg font-semibold">3</p>{" "}
              {/* Placeholder, Anda perlu API terpisah untuk ini */}
              <small className="text-gray-600">Produk Terjual</small>
            </div>
          </div>
        </section>

        {/* Order Status Table */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Status Pemesanan Teratas
          </h2>
          {loadingOrders ? (
            <div className="text-center py-8 text-gray-500">
              Memuat pesanan...
            </div>
          ) : ordersError ? (
            <div className="text-center py-8 text-red-500">
              Error: {ordersError}
            </div>
          ) : topOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada pesanan ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Nama Pembeli</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {topOrders.map((orderItem) => (
                    <tr
                      key={orderItem.order}
                      className="border-t border-gray-100"
                    >
                      <td className="px-4 py-3">{orderItem.order}</td>
                      <td className="px-4 py-3">{orderItem.name}</td>
                      <td className="px-4 py-3">{orderItem.date}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-sm rounded-full font-semibold ${getStatusClass(
                            orderItem.status
                          )}`}
                        >
                          {orderItem.status.charAt(0).toUpperCase() +
                            orderItem.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{orderItem.place}</td>
                      <td className="px-4 py-3">{orderItem.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
