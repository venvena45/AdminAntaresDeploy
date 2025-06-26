// src/components/Layout.jsx

import React from "react";
import { Outlet, useLocation, Link, Navigate } from "react-router-dom";
import {
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const navItems = [
  { to: "/", label: "Dashboard", icon: <FiHome /> },
  { to: "/pesanan", label: "Pemesanan", icon: <FiShoppingCart /> },
  { to: "/produk", label: "Produk", icon: <FiPackage /> },
  { to: "/report", label: "Report Penjualan", icon: <FiBarChart2 /> },
  { to: "/pengaturan", label: "Pengaturan", icon: <FiSettings /> },
  { to: "/keluar", label: "Keluar", icon: <FiLogOut /> },
];

const Layout = () => {
  const location = useLocation();

  // ==========================================================
  // Logika Proteksi Rute diletakkan di sini
  // ==========================================================
  const isAuthenticated = !!localStorage.getItem("authToken"); // Sesuaikan dengan key token Anda

  if (!isAuthenticated) {
    // Jika tidak ada token, langsung arahkan ke halaman login
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, tampilkan layout dengan konten halaman
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex-shrink-0">
        <div className="p-6 text-center border-b">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            <span className="text-3xl block mb-2">🏥</span>
            Apotek ANTARES
          </h1>
        </div>
        <nav className="mt-4 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group
                    ${
                      location.pathname === item.to
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
