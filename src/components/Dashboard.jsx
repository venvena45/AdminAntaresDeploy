import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

// --- Konstanta API ---
const API_BASE_URL = "https://antaresapi-production.up.railway.app/api";

// --- Fungsi Helper untuk API ---

/**
 * Mengambil semua data pesanan dari API.
 */
const getAllPesanan = async () => {
  const response = await fetch(`${API_BASE_URL}/pesanan`);
  if (!response.ok) {
    throw new Error(
      `Gagal mengambil daftar pesanan. Status: ${response.status}`
    );
  }
  const data = await response.json();
  // Menangani format respons yang mungkin berbeda
  return Array.isArray(data) ? data : data.data || [];
};

/**
 * Mengambil detail pengguna berdasarkan ID.
 */
const getUserById = async (userId) => {
  if (!userId) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`);
    if (!response.ok) {
      console.warn(`Gagal mengambil data untuk User ID: ${userId}.`);
      return {
        nama: `[ID: ${userId}]`,
        alamat: "N/A",
      };
    }
    const responseData = await response.json();
    return responseData.user || { nama: `[Data Salah]`, alamat: "N/A" };
  } catch (error) {
    console.error(`Error saat mengambil User ID: ${userId}`, error);
    return { nama: `[Gagal Muat]`, alamat: "N/A" };
  }
};

const Dashboard = () => {
  const [topOrders, setTopOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrderCount, setTotalOrderCount] = useState(0);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
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

  const fetchData = useCallback(async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const allOrders = await getAllPesanan();

      if (allOrders.length === 0) {
        setTopOrders([]);
        setTotalSales(0);
        setTotalOrderCount(0);
        return;
      }

      // 1. Hitung total dari SEMUA pesanan
      const calculatedTotalSales = allOrders.reduce(
        (sum, item) => sum + (Number(item.total_harga) || 0),
        0
      );
      setTotalSales(calculatedTotalSales);
      setTotalOrderCount(allOrders.length);

      // 2. [DIPERBAIKI] Urutkan berdasarkan ID pesanan (terbaru ke terlama) dan ambil 5 teratas
      const sortedAndLimitedOrders = allOrders
        .sort((a, b) => b.pesanan_id - a.pesanan_id)
        .slice(0, 5);

      // 3. Ambil detail pengguna untuk 5 pesanan teratas
      const transformedOrdersPromises = sortedAndLimitedOrders.map(
        async (item) => {
          const userData = await getUserById(item.pelanggan_id);
          return {
            order: item.pesanan_id,
            name: userData?.nama || `Pelanggan ID: ${item.pelanggan_id}`,
            date: new Date(item.tanggal_pesan).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            status: item.status_pesanan,
            place:
              item.alamat_pengiriman || userData?.alamat || "Tidak Tersedia",
            total: `Rp ${Number(item.total_harga || 0).toLocaleString(
              "id-ID"
            )}`,
          };
        }
      );

      const finalTransformedOrders = await Promise.all(
        transformedOrdersPromises
      );
      setTopOrders(finalTransformedOrders);
    } catch (err) {
      console.error("Dashboard: Gagal memuat data:", err);
      setOrdersError(`Gagal memuat data. Detail: ${err.message}`);
      setTotalSales(0);
      setTotalOrderCount(0);
    } finally {
      setLoadingOrders(false);
    }
  }, []); // useCallback dependency kosong agar fungsi tidak dibuat ulang

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
                <p className="text-lg font-semibold">{totalOrderCount}</p>
              )}
              <small className="text-gray-600">Total Pesanan</small>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-green-100 p-5 rounded-lg flex-1 min-w-[250px]">
            <div className="text-3xl">💊</div>
            <div>
              <p className="text-lg font-semibold">3</p>
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
