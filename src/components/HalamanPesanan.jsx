import React, { useEffect, useState } from "react";

const HalamanPesanan = () => {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("semua");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("http://localhost:3000/api/pesanan")
        .then((res) => res.json())
        .then((data) => {
          setPesanan(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal memuat data pesanan:", err);
          setLoading(false);
        });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const dummyData = [
        {
          id: 1,
          namaPembeli: "Budi Santoso",
          alamat: "Jl. Mawar No. 10, Jakarta Selatan",
          obat: [
            { nama: "Paracetamol", jumlah: 2 },
            { nama: "Vitamin C", jumlah: 1 },
          ],
          totalJumlah: 3,
          totalHarga: 75000,
          status: "Selesai",
          tanggal: "2023-05-20",
        },
        {
          id: 2,
          namaPembeli: "Siti Nurhaliza",
          alamat: "Jl. Melati No. 5, Jakarta Pusat",
          obat: [{ nama: "Amoxicillin", jumlah: 1 }],
          totalJumlah: 1,
          totalHarga: 45000,
          status: "Diproses",
          tanggal: "2023-05-21",
        },
        {
          id: 3,
          namaPembeli: "Ahmad Wahyu",
          alamat: "Jl. Kenanga No. 8, Jakarta Timur",
          obat: [
            { nama: "Ibuprofen", jumlah: 1 },
            { nama: "Antasida", jumlah: 2 },
            { nama: "Vitamin B Complex", jumlah: 1 },
          ],
          totalJumlah: 4,
          totalHarga: 120000,
          status: "Dikirim",
          tanggal: "2023-05-19",
        },
        {
          id: 4,
          namaPembeli: "Dewi Lestari",
          alamat: "Jl. Anggrek No. 15, Jakarta Barat",
          obat: [{ nama: "Cetirizine", jumlah: 2 }],
          totalJumlah: 2,
          totalHarga: 30000,
          status: "Menunggu",
          tanggal: "2023-05-21",
        },
      ]; // Data dummy sama seperti sebelumnya
      setTimeout(() => {
        setPesanan(dummyData);
        setLoading(false);
      }, 1000);
    }
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🛍️ Daftar Pesanan Masuk
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="text-xl">
            {darkMode ? "☀️" : "🌙"}
          </button>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari pesanan..."
              className="pl-10 pr-4 py-2 border rounded-md w-64"
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
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
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
          <h3 className="text-lg font-semibold">Tidak ada pesanan ditemukan</h3>
          <p className="text-gray-500">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-100">
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
                    className="text-left px-4 py-2 text-sm font-semibold"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPesanan.map((item, index) => (
                <tr key={item.id} className="even:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{index + 1}</td>
                  <td className="px-4 py-2 text-sm">
                    <div>{item.namaPembeli}</div>
                    <div className="text-xs text-gray-500">{item.tanggal}</div>
                  </td>
                  <td className="px-4 py-2 text-sm">{item.alamat}</td>
                  <td className="px-4 py-2 text-sm">
                    <ul className="list-disc ml-5">
                      {item.obat.map((obat, idx) => (
                        <li key={idx}>
                          {obat.nama} ({obat.jumlah})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 text-sm">{item.totalJumlah}</td>
                  <td className="px-4 py-2 text-sm">
                    Rp {item.totalHarga.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
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
