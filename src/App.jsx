import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./components/Dashboard";
import ProductManagement from "./components/ProductManagement";
import HalamanPesanan from "./components/HalamanPesanan";
import ReportPenjualan from "./components/ReportPenjualan";
import StockOpname from "./components/StockOpname";
import Pengaturan from "./components/Pengaturan";
import Keluar from "./components/Keluar";
import LoginAdmin from "./components/LoginAdmin";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginAdmin />} />
        <Route path="/keluar" element={<Keluar />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produk" element={<ProductManagement />} />
          <Route path="/pesanan" element={<HalamanPesanan />} />
          <Route path="/report" element={<ReportPenjualan />} />
          <Route path="/stok-opname" element={<StockOpname />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
        </Route>

        {/* Redirect semua route yang tidak dikenal ke dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
