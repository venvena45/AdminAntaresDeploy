import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ProductManagement from "./components/ProductManagement";
import HalamanPesanan from "./components/HalamanPesanan";
import ReportPenjualan from "./components/ReportPenjualan";
import StockOpname from "./components/StockOpname";
import Pengaturan from "./components/Pengaturan";
// import other components like Produk, Pesanan, etc if you have them

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/produk" element={<ProductManagement />} />
        <Route path="/pesanan" element={<HalamanPesanan />} />
        <Route path="/report" element={<ReportPenjualan />} />
        <Route path="/stok-opname" element={<StockOpname />} />
        <Route path="/pengaturan" element={<Pengaturan />} />
      </Routes>
    </Router>
  );
}

export default App;
