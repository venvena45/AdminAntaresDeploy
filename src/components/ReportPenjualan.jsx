import React, { useEffect, useState, useCallback } from "react";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import jsPDF from "https://esm.sh/jspdf@2.5.1";
import "https://esm.sh/jspdf-autotable@3.5.28";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// =================================================================================
// KOMPONEN LAYOUT BERSAMA (SHARED LAYOUT COMPONENT)
// =================================================================================
// Komponen ini kita gunakan kembali untuk membungkus halaman laporan.
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
// KONTEN HALAMAN LAPORAN PENJUALAN (REPORT CONTENT)
// =================================================================================
// Ini adalah kode asli Anda, sekarang menjadi komponen konten.

const API_BASE_URL = "https://antaresapi-production-006d.up.railway.app/api";

const getAllPesanan = async () => {
  const response = await fetch(`${API_BASE_URL}/pesanan`);
  if (!response.ok) throw new Error("Gagal mengambil data pesanan");
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
};

const getDetailPesananById = async (pesananId) => {
  if (!pesananId) return [];
  const response = await fetch(
    `${API_BASE_URL}/detail-pesanan/pesanan/${pesananId}`
  );
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
};

const getAllObat = async () => {
  const response = await fetch(`${API_BASE_URL}/obat`);
  if (!response.ok) throw new Error("Gagal mengambil data obat");
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
};

const ReportPenjualanContent = () => {
  const [allSalesItems, setAllSalesItems] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("semua");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periode, setPeriode] = useState("bulanan");
  const [grafikTahunan, setGrafikTahunan] = useState([]);
  const [reloading, setReloading] = useState(false);

  const fetchData = useCallback(async () => {
    setReloading(true);
    setError(null);
    try {
      const [semuaPesanan, semuaObat] = await Promise.all([
        getAllPesanan(),
        getAllObat(),
      ]);
      const obatMap = new Map(
        semuaObat.map((obat) => [String(obat.obat_id).trim(), obat])
      );
      const detailPromises = semuaPesanan.map((pesanan) =>
        getDetailPesananById(pesanan.pesanan_id).then((details) =>
          (details || []).map((d) => ({ ...d, tanggal: pesanan.tanggal_pesan }))
        )
      );
      const detailData = await Promise.all(detailPromises);
      const laporan = detailData.flat().filter(Boolean);
      const processed = laporan.map((item) => {
        const obatData = obatMap.get(String(item.obat_id).trim());
        return {
          ...item,
          namaObat: obatData?.nama_obat || "Obat Tidak Dikenal",
          hargaSatuan: obatData?.harga_satuan || 0,
        };
      });
      setAllSalesItems(processed);
      const months = new Set(
        processed
          .filter((item) => item.tanggal && !isNaN(new Date(item.tanggal)))
          .map((item) => new Date(item.tanggal).toISOString().slice(0, 7))
      );
      setAvailableMonths(["semua", ...Array.from(months).sort().reverse()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setReloading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (periode === "bulanan") {
      const filtered =
        selectedMonth === "semua"
          ? allSalesItems
          : allSalesItems.filter(
              (i) =>
                new Date(i.tanggal).toISOString().slice(0, 7) === selectedMonth
            );

      const aggregated = new Map();
      filtered.forEach((item) => {
        const key = item.obat_id;
        const total = item.jumlah * item.hargaSatuan;
        if (aggregated.has(key)) {
          const exist = aggregated.get(key);
          exist.jumlahTerjual += item.jumlah;
          exist.totalPenjualan += total;
        } else {
          aggregated.set(key, {
            id: key,
            namaObat: item.namaObat,
            jumlahTerjual: item.jumlah,
            totalPenjualan: total,
          });
        }
      });
      setDisplayData(Array.from(aggregated.values()));
    } else {
      const monthAgg = {};
      allSalesItems.forEach((item) => {
        const date = new Date(item.tanggal);
        if (isNaN(date)) return;
        const label = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (!monthAgg[label]) {
          monthAgg[label] = {
            bulan: label,
            jumlahTerjual: 0,
            totalPenjualan: 0,
          };
        }
        monthAgg[label].jumlahTerjual += item.jumlah;
        monthAgg[label].totalPenjualan += item.jumlah * item.hargaSatuan;
      });
      const sortedData = Object.values(monthAgg)
        .sort((a, b) => new Date(a.bulan) - new Date(b.bulan))
        .slice(-12);
      setGrafikTahunan(sortedData);
    }
  }, [selectedMonth, allSalesItems, periode]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      displayData.map((d, i) => ({
        No: i + 1,
        "Nama Obat": d.namaObat,
        "Jumlah Terjual": d.jumlahTerjual,
        "Total Penjualan": d.totalPenjualan,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `Laporan_Penjualan_${selectedMonth}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Laporan Penjualan - ${selectedMonth}`, 14, 10);
    doc.autoTable({
      head: [["No", "Nama Obat", "Jumlah Terjual", "Total Penjualan"]],
      body: displayData.map((d, i) => [
        i + 1,
        d.namaObat,
        d.jumlahTerjual,
        `Rp ${d.totalPenjualan.toLocaleString()}`,
      ]),
      startY: 20,
    });
    doc.save(`Laporan_Penjualan_${selectedMonth}.pdf`);
  };

  const formatMonth = (val) => {
    if (val === "semua") return "Semua Bulan";
    if (!val || !val.includes("-")) return val;
    const [y, m] = val.split("-");
    const date = new Date(y, m - 1);
    return isNaN(date)
      ? val
      : date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  if (loading)
    return <div className="p-6 text-center">Memuat data laporan...</div>;
  if (error)
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    // Styling asli Anda dipertahankan untuk membungkus konten di dalam 'main'
    <div className="bg-white p-6 shadow-md rounded-lg">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
        Report Penjualan
      </h1>
      <div className="flex flex-wrap gap-3 items-center mb-4 p-4 bg-gray-50 rounded-lg">
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="border px-3 py-2 rounded-lg shadow-sm"
        >
          <option value="bulanan">Laporan per Produk (Bulanan)</option>
          <option value="tahunan">Tren Penjualan (1 Tahun Terakhir)</option>
        </select>
        {periode === "bulanan" && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-sm"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 flex items-center gap-2 transition-colors"
          disabled={reloading}
        >
          {reloading ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            "Muat Ulang Data"
          )}
        </button>
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        <div>
          <h4 className="font-semibold mb-2 text-center text-gray-700">
            Jumlah Terjual
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={periode === "bulanan" ? displayData : grafikTahunan}
              margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={periode === "bulanan" ? "namaObat" : "bulan"}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={70}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="jumlahTerjual"
                fill="#3b82f6"
                name="Jumlah Terjual"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-center text-gray-700">
            Total Penjualan (Rp)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={periode === "bulanan" ? displayData : grafikTahunan}
              margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={periode === "bulanan" ? "namaObat" : "bulan"}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={70}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                tickFormatter={(val) =>
                  new Intl.NumberFormat("id-ID").format(val)
                }
              />
              <Tooltip
                formatter={(val) =>
                  `Rp ${new Intl.NumberFormat("id-ID").format(val)}`
                }
              />
              <Bar
                dataKey="totalPenjualan"
                fill="#10b981"
                name="Total Penjualan"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tombol export & Tabel */}
      {periode === "bulanan" && (
        <>
          {displayData.length > 0 && (
            <div className="flex gap-3 mb-4">
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors"
              >
                Export Excel
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors"
              >
                Export PDF
              </button>
            </div>
          )}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Nama Obat</th>
                  <th className="px-4 py-3 text-center">Jumlah Terjual</th>
                  <th className="px-4 py-3 text-left">Total Penjualan</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="odd:bg-white even:bg-gray-50 border-t"
                  >
                    <td className="px-4 py-2 text-center">{index + 1}</td>
                    <td className="px-4 py-2">{item.namaObat}</td>
                    <td className="px-4 py-2 text-center font-medium">
                      {item.jumlahTerjual}
                    </td>
                    <td className="px-4 py-2 font-semibold text-green-700">
                      Rp {item.totalPenjualan.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// =================================================================================
// KOMPONEN EXPORT UTAMA (MAIN EXPORTED COMPONENT)
// =================================================================================
// Komponen ini yang akan diekspor dan digunakan pada sistem routing aplikasi Anda.

const ReportPenjualanPage = () => {
  return (
    // Gunakan Layout, dan set activePage ke "Report Penjualan"
    // agar item menu yang sesuai di sidebar menjadi aktif.
    <Layout activePage="Report Penjualan">
      <ReportPenjualanContent />
    </Layout>
  );
};

export default ReportPenjualanPage;
