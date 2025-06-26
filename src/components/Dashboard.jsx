import React, { useEffect, useState, useCallback } from "react";

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

// Komponen Loading Skeleton
const SkeletonCard = () => (
  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-xl animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

// Komponen Counter dengan animasi
const AnimatedCounter = ({
  target,
  duration = 2000,
  prefix = "",
  suffix = "",
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      {prefix}
      {count.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
};

const Dashboard = () => {
  const [topOrders, setTopOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "menunggu":
        return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg shadow-yellow-200";
      case "diproses":
        return "bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-200";
      case "dikirim":
        return "bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg shadow-purple-200";
      case "selesai":
        return "bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg shadow-green-200";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200";
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

      const calculatedTotalSales = allOrders.reduce(
        (sum, item) => sum + (Number(item.total_harga) || 0),
        0
      );
      setTotalSales(calculatedTotalSales);
      setTotalOrderCount(allOrders.length);

      const sortedAndLimitedOrders = allOrders
        .sort((a, b) => b.pesanan_id - a.pesanan_id)
        .slice(0, 5);

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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredOrders = topOrders.filter(
    (order) =>
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order.toString().includes(searchTerm)
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar dengan efek glassmorphism */}
      <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-white/20 p-6 shadow-xl">
        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-10 text-center">
          <div className="text-3xl mb-2">🏥</div>
          Apotek ANTARES
        </div>
        <nav>
          <ul className="space-y-3">
            {[
              { to: "/dashboard", label: "Dashboard", icon: "📊" },
              { to: "/pesanan", label: "Pemesanan", icon: "🛒" },
              { to: "/produk", label: "Produk", icon: "💊" },
              { to: "/report", label: "Report Penjualan", icon: "📈" },
              { to: "/pengaturan", label: "Pengaturan", icon: "⚙️" },
              { to: "/keluar", label: "Keluar", icon: "🚪" },
            ].map((item, index) => (
              <li
                key={index}
                className="transform transition-all duration-200 hover:scale-105"
              >
                <a
                  href={item.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-300 group cursor-pointer"
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

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header dengan animasi */}
        <header className="flex justify-between items-center mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard Analisa
            </h1>
            <p className="text-gray-600 mt-1">
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              - {currentTime.toLocaleTimeString("id-ID")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Cari pesanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
              />
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl text-white shadow-lg">
              <div className="text-right">
                <div className="font-bold text-lg">Yuzar</div>
                <div className="text-sm opacity-90">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Summary Cards dengan animasi dan gradient */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {loadingOrders ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <div className="group bg-gradient-to-br from-red-400 via-red-500 to-pink-500 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90 mb-2">
                      Total Penjualan
                    </div>
                    {ordersError ? (
                      <div className="text-2xl font-bold">Error</div>
                    ) : (
                      <AnimatedCounter target={totalSales} prefix="Rp. " />
                    )}
                  </div>
                  <div className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    💰
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Real-time data
                </div>
              </div>

              <div className="group bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90 mb-2">Total Pesanan</div>
                    {ordersError ? (
                      <div className="text-2xl font-bold">Error</div>
                    ) : (
                      <AnimatedCounter target={totalOrderCount} />
                    )}
                  </div>
                  <div className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    📦
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Active orders
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90 mb-2">
                      Produk Terjual
                    </div>
                    <AnimatedCounter target={3} />
                  </div>
                  <div className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    💊
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Categories
                </div>
              </div>
            </>
          )}
        </section>

        {/* Order Status Table dengan design modern */}
        <section className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              📋 Status Pemesanan Teratas
            </h2>
            <button
              onClick={fetchData}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔄 Refresh
            </button>
          </div>

          {loadingOrders ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Memuat pesanan...</p>
            </div>
          ) : ordersError ? (
            <div className="text-center py-12 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-600 font-semibold">Error: {ordersError}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-600">
                {searchTerm
                  ? "Tidak ada pesanan yang cocok dengan pencarian."
                  : "Tidak ada pesanan ditemukan."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-xl">
                    {[
                      "Order ID",
                      "Nama Pembeli",
                      "Tanggal",
                      "Status",
                      "Lokasi",
                      "Total",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-left text-sm font-bold text-gray-700 first:rounded-tl-xl last:rounded-tr-xl"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredOrders.map((orderItem, index) => (
                    <tr
                      key={orderItem.order}
                      className="border-t border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-[1.01]"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${
                          index * 0.1
                        }s both`,
                      }}
                    >
                      <td className="px-6 py-4 font-semibold text-blue-600">
                        #{orderItem.order}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {orderItem.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {orderItem.date}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-4 py-2 text-xs rounded-full font-bold ${getStatusClass(
                            orderItem.status
                          )} transform hover:scale-105 transition-all duration-200`}
                        >
                          {orderItem.status.charAt(0).toUpperCase() +
                            orderItem.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {orderItem.place}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">
                        {orderItem.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
