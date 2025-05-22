import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportPenjualan = () => {
  const [dataPenjualan, setDataPenjualan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/penjualan');
        const data = await response.json();
        setDataPenjualan(data);
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      dataPenjualan.map((item, index) => ({
        No: index + 1,
        Nama_Obat: item.namaObat,
        Jumlah_Terjual: item.jumlah,
        Harga_Satuan: item.hargaSatuan,
        Total_Penjualan: item.jumlah * item.hargaSatuan,
        Tanggal: new Date(item.tanggal).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');
    XLSX.writeFile(workbook, 'Laporan_Penjualan.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Laporan Penjualan Obat', 14, 10);
    doc.autoTable({
      head: [['No', 'Nama Obat', 'Jumlah Terjual', 'Harga Satuan', 'Total Penjualan', 'Tanggal']],
      body: dataPenjualan.map((item, index) => [
        index + 1,
        item.namaObat,
        item.jumlah,
        `Rp ${item.hargaSatuan.toLocaleString()}`,
        `Rp ${(item.jumlah * item.hargaSatuan).toLocaleString()}`,
        new Date(item.tanggal).toLocaleDateString(),
      ]),
      startY: 20,
    });
    doc.save('Laporan_Penjualan.pdf');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg font-sans">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Laporan Penjualan Obat</h2>

      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={exportToExcel}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          Export Excel
        </button>
        <button
          onClick={exportToPDF}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          Export PDF
        </button>
      </div>

      {loading ? (
        <p className="italic text-gray-500 text-center mt-10">Memuat data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Obat</th>
                <th className="py-3 px-4">Jumlah Terjual</th>
                <th className="py-3 px-4">Harga Satuan</th>
                <th className="py-3 px-4">Total Penjualan</th>
                <th className="py-3 px-4">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {dataPenjualan.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 italic text-gray-500">
                    Tidak ada data penjualan.
                  </td>
                </tr>
              ) : (
                dataPenjualan.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? 'bg-gray-50 hover:bg-blue-50 transition-colors' : 'hover:bg-blue-50 transition-colors'}
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{item.namaObat}</td>
                    <td className="py-3 px-4">{item.jumlah}</td>
                    <td className="py-3 px-4">Rp {item.hargaSatuan.toLocaleString()}</td>
                    <td className="py-3 px-4">Rp {(item.jumlah * item.hargaSatuan).toLocaleString()}</td>
                    <td className="py-3 px-4">{new Date(item.tanggal).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportPenjualan;
