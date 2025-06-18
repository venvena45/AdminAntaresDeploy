import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
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
            <li className="cursor-pointer hover:underline">Pesan</li>
            <li className="cursor-pointer hover:underline">
              <Link to="/pengaturan" className="hover:underline">
                Pengaturan
              </Link>
            </li>
            <li className="cursor-pointer hover:underline">Keluar</li>
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
        <section className="flex gap-6 mb-10">
          <div className="flex items-center gap-4 bg-red-100 p-5 rounded-lg flex-1">
            <div className="text-3xl">📊</div>
            <div>
              <p className="text-lg font-semibold">Rp. 225.000</p>
              <small className="text-gray-600">Total Penjualan</small>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-yellow-100 p-5 rounded-lg flex-1">
            <div className="text-3xl">📦</div>
            <div>
              <p className="text-lg font-semibold">300</p>
              <small className="text-gray-600">Total Pesanan</small>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-green-100 p-5 rounded-lg flex-1">
            <div className="text-3xl">💊</div>
            <div>
              <p className="text-lg font-semibold">3</p>
              <small className="text-gray-600">Produk Terjual</small>
            </div>
          </div>
        </section>

        {/* Order Status Table */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Status Pemesanan</h2>
          <div className="overflow-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Place</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-t">
                  <td className="px-4 py-3">01</td>
                  <td className="px-4 py-3">Anazia</td>
                  <td className="px-4 py-3">Jan 20, 2025</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-semibold">
                      Delivered
                    </span>
                  </td>
                  <td className="px-4 py-3">Yogyakarta</td>
                  <td className="px-4 py-3">Rp. 50.000</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">02</td>
                  <td className="px-4 py-3">Syedina</td>
                  <td className="px-4 py-3">Jan 24, 2025</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-semibold">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-3">Bantul</td>
                  <td className="px-4 py-3">Rp. 100.000</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">03</td>
                  <td className="px-4 py-3">Asyifaa</td>
                  <td className="px-4 py-3">Feb 21, 2025</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-semibold">
                      Cancelled
                    </span>
                  </td>
                  <td className="px-4 py-3">Condong Catur</td>
                  <td className="px-4 py-3">Rp. 75.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
