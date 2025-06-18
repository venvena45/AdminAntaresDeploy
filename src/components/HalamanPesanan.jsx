import React, { useEffect, useState } from "react";

const HalamanPesanan = () => {
  // State untuk menyimpan daftar pesanan
  const [pesanan, setPesanan] = useState([]);
  // State untuk melacak status loading data
  const [loading, setLoading] = useState(true);
  // State untuk kata kunci pencarian
  const [searchTerm, setSearchTerm] = useState("");
  // State untuk filter status pesanan
  const [filter, setFilter] = useState("semua");
  // State untuk mode gelap/terang
  const [darkMode, setDarkMode] = useState(false);
  // State untuk error jika fetch API gagal
  const [error, setError] = useState(null);

  // ** DEBUGGING OPTION: Atur ke true untuk menggunakan data dummy jika API bermasalah **
  const USE_DUMMY_DATA = false; // Ubah ini menjadi 'true' jika Anda ingin menguji dengan data dummy

  // Data dummy yang akan digunakan jika USE_DUMMY_DATA diatur ke true
  const dummyData = [
    {
      id: 1,
      namaPembeli: "Budi Santoso (Dummy)",
      alamat: "Jl. Mawar No. 10, Jakarta Selatan",
      obat: [
        { nama: "Paracetamol", jumlah: 2 },
        { nama: "Vitamin C", jumlah: 1 },
      ],
      totalJumlah: 3,
      totalHarga: 75000,
      status: "selesai",
      tanggal: "2023-05-20",
    },
    {
      id: 2,
      namaPembeli: "Siti Nurhaliza (Dummy)",
      alamat: "Jl. Melati No. 5, Jakarta Pusat",
      obat: [{ nama: "Amoxicillin", jumlah: 1 }],
      totalJumlah: 1,
      totalHarga: 45000,
      status: "diproses",
      tanggal: "2023-05-21",
    },
    {
      id: 3,
      namaPembeli: "Ahmad Wahyu (Dummy)",
      alamat: "Jl. Kenanga No. 8, Jakarta Timur",
      obat: [
        { nama: "Ibuprofen", jumlah: 1 },
        { nama: "Antasida", jumlah: 2 },
        { nama: "Vitamin B Complex", jumlah: 1 },
      ],
      totalJumlah: 4,
      totalHarga: 120000,
      status: "dikirim",
      tanggal: "2023-05-19",
    },
    {
      id: 4,
      namaPembeli: "Dewi Lestari (Dummy)",
      alamat: "Jl. Anggrek No. 15, Jakarta Barat",
      obat: [{ nama: "Cetirizine", jumlah: 2 }],
      totalJumlah: 2,
      totalHarga: 30000,
      status: "menunggu",
      tanggal: "2023-05-21",
    },
  ];

  // Efek untuk beralih mode gelap pada body dokumen
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Efek untuk memuat data pesanan dari API atau data dummy
  useEffect(() => {
    const API_BASE_URL = "https://antaresapi-production.up.railway.app/api";
    const API_ENDPOINT = `${API_BASE_URL}/pesanan`;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (USE_DUMMY_DATA) {
        // Menggunakan data dummy jika USE_DUMMY_DATA true
        console.log("Menggunakan data dummy...");
        setTimeout(() => {
          setPesanan(dummyData);
          setLoading(false);
        }, 1000);
        return; // Hentikan eksekusi fetch API
      }

      try {
        console.log("Mencoba mengambil data dari:", API_ENDPOINT);
        const res = await fetch(API_ENDPOINT);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `HTTP error! status: ${res.status}, detail: ${errorText}`
          );
        }

        const rawData = await res.json();
        console.log("📦 Respons mentah dari API /pesanan:", rawData);

        let dataToTransform = [];
        // Menangani format respons yang mungkin berbeda (array langsung atau objek dengan properti 'data')
        if (Array.isArray(rawData)) {
          dataToTransform = rawData;
        } else if (rawData && Array.isArray(rawData.data)) {
          dataToTransform = rawData.data;
        } else {
          console.warn(
            "Format respons API tidak sesuai ekspektasi (bukan array langsung atau objek dengan properti 'data' berupa array). Menganggap tidak ada data."
          );
          setPesanan([]); // Pastikan pesanan kosong jika format tidak cocok
          setLoading(false);
          return;
        }

        const transformedData = dataToTransform.map((item) => ({
          id: item.pesanan_id,
          namaPembeli: `Pelanggan ID: ${item.pelanggan_id || "N/A"}`,
          alamat: "Alamat tidak tersedia",
          obat: [{ nama: "Detail obat tidak tersedia", jumlah: 0 }],
          totalJumlah: 0,
          totalHarga: item.total_harga,
          status: item.status_pesanan,
          tanggal: item.tanggal_pesan,
        }));
        setPesanan(transformedData);
        console.log("✅ Data pesanan setelah transformasi:", transformedData);
      } catch (err) {
        console.error("Gagal memuat data pesanan:", err);
        setError(
          `Gagal memuat data pesanan. Ini mungkin masalah CORS atau API tidak aktif. Detail: ${err.message}`
        );
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    fetchData();
  }, []); // Efek ini hanya berjalan sekali saat komponen di-mount

  // Filter pesanan berdasarkan pencarian dan status
  const filteredPesanan = pesanan.filter((item) => {
    const matchSearch =
      item.namaPembeli.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.obat.some((o) =>
        o.nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchFilter =
      filter === "semua" || item.status.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

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

  // Fungsi untuk mendapatkan ikon emoji berdasarkan status
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "menunggu":
        return "⏱️";
      case "diproses":
        return "📦";
      case "dikirim":
        return "🚚";
      case "selesai":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  // Tampilan loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Memuat data pesanan...
      </div>
    );
  }

  // Tampilan error
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Pastikan server API Anda berjalan dan mengizinkan permintaan CORS dari
          domain ini. Anda bisa mengubah `USE_DUMMY_DATA` menjadi `true` di kode
          untuk melihat UI dengan data dummy.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-6 min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🛍️ Daftar Pesanan Masuk
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={
              darkMode ? "Beralih ke mode terang" : "Beralih ke mode gelap"
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari pesanan..."
              className={`pl-10 pr-4 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["semua", "menunggu", "diproses", "dikirim", "selesai"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === status
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {getStatusIcon(status)}{" "}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {filteredPesanan.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❓</div>
          <h3
            className={`text-lg font-semibold ${
              darkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Tidak ada pesanan ditemukan
          </h3>
          <p className="text-gray-500">
            Coba ubah filter atau kata kunci pencarian Anda
            {USE_DUMMY_DATA &&
              " (Ini adalah data dummy, Anda bisa mengubah `USE_DUMMY_DATA` ke `false` untuk mencoba API sungguhan)."}
            {!USE_DUMMY_DATA &&
              !loading &&
              !error &&
              " (Jika Anda yakin API berfungsi, mungkin tidak ada pesanan dengan kriteria ini. Periksa konsol untuk respons API mentah)."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table
            className={`min-w-full divide-y ${
              darkMode ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <tr>
                {[
                  "No",
                  "Nama Pembeli",
                  "Alamat",
                  "Obat yang Dipesan",
                  "Jumlah",
                  "Total Harga",
                  "Status",
                ].map((th, i) => (
                  <th
                    key={i}
                    className={`text-left px-4 py-3 text-sm font-semibold uppercase tracking-wider ${
                      darkMode ? "text-gray-200" : "text-gray-600"
                    }`}
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`${darkMode ? "bg-gray-800" : "bg-white"} divide-y ${
                darkMode ? "divide-gray-700" : "divide-gray-200"
              }`}
            >
              {filteredPesanan.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${
                    darkMode ? "even:bg-gray-700" : "even:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>{item.namaPembeli}</div>
                    <div className="text-xs text-gray-500">{item.tanggal}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.alamat}</td>
                  <td className="px-4 py-3 text-sm">
                    <ul className="list-disc ml-5">
                      {item.obat.map((obat, idx) => (
                        <li key={idx}>
                          {obat.nama} ({obat.jumlah})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.totalJumlah}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    Rp {item.totalHarga.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)} {item.status}
                    </span>
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

export default HalamanPesanan;
