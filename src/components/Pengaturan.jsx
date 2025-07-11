import React, { useState, useEffect, useMemo } from "react";

// --- Komponen-Komponen UI ---

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-ping opacity-20"></div>
      <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full">
        <div className="absolute inset-2 bg-white rounded-full"></div>
      </div>
    </div>
    <div className="mt-6 text-center">
      <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
        <span>⚕️</span>
        <span>Apotek Antares</span>
      </div>
      <p className="mt-2 text-gray-600 animate-pulse">
        Memuat data administrasi...
      </p>
    </div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 text-center p-4">
    <div className="transform hover:scale-105 transition-transform duration-300">
      <div className="bg-white border-2 border-red-200 rounded-2xl shadow-2xl p-8 max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Oops! Ada Masalah
        </h3>
        <p className="text-gray-600 mb-6">
          {message || "Tidak dapat memuat data administratif."}
        </p>
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          🔄 Coba Lagi
        </button>
      </div>
    </div>
  </div>
);

// --- Komponen Modal untuk Menambah Admin ---

const AddAdminModal = ({ allUsers, onAddAdmin, onClose, isUpdating }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const potentialAdmins = useMemo(() => {
    if (!searchTerm) return [];
    return allUsers.filter(
      (user) =>
        user.role !== "Admin" &&
        (user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, allUsers]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-200 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header dengan gradient */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-6 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <span>👨‍⚕️</span>
                Tambah Admin Baru
              </h3>
              <p className="opacity-90 mt-1">
                Pilih karyawan untuk dijadikan administrator
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Ketik nama atau email untuk mencari karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors text-gray-700"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {potentialAdmins.length > 0 ? (
            <div className="p-4 space-y-3">
              {potentialAdmins.map((user, index) => (
                <div
                  key={user.user_id}
                  className={`flex justify-between items-center p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200 transform hover:scale-[1.02] ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{user.nama}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span>📧</span>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onAddAdmin(user)}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-2 px-4 rounded-xl hover:from-emerald-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:shadow-none"
                  >
                    👑 Jadikan Admin
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">{searchTerm ? "🔍" : "👥"}</div>
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "Karyawan tidak ditemukan atau sudah menjadi admin"
                  : "Mulai mengetik untuk mencari karyawan"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={handleClose}
            className="bg-gray-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-600 transform hover:scale-105 transition-all duration-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Komponen Utama Manajemen Admin ---

const AdminManagement = () => {
  const handleBackNavigation = () => {
    // Simulasi navigasi kembali
    window.history.back();
  };
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = "https://antaresapi-production-006d.up.railway.app/api";

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`);
      if (!response.ok)
        throw new Error(`Gagal mengambil data. Status: ${response.status}`);
      const data = await response.json();
      if (data && Array.isArray(data.users)) {
        setAllUsers(data.users);
      } else {
        throw new Error("Struktur data API tidak sesuai.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (user, newRole) => {
    const actionText =
      newRole === "Admin"
        ? "menjadikan administrator"
        : "menghapus dari administrator";
    const confirmMessage = `⚠️ Konfirmasi Perubahan\n\nApakah Anda yakin ingin ${actionText} untuk:\n👤 ${user.nama}\n📧 ${user.email}`;

    if (window.confirm(confirmMessage)) {
      setUpdatingUserId(user.user_id);
      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/users/${user.user_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nama: user.nama || "",
              email: user.email || "",
              role: newRole,
              alamat: user.alamat || "",
              no_telepon: user.no_telepon || "",
            }),
          }
        );

        if (!response.ok)
          throw new Error(`Update API gagal. Status: ${response.status}`);

        setAllUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.user_id === user.user_id ? { ...u, role: newRole } : u
          )
        );

        alert(
          `✅ Berhasil!\n\n${user.nama} sekarang adalah ${
            newRole === "Admin" ? "Administrator" : "Karyawan"
          }.`
        );
        if (newRole === "Admin") setIsModalOpen(false);
      } catch (err) {
        alert(`❌ Gagal mengubah role!\n\nKesalahan: ${err.message}`);
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  const adminUsers = allUsers.filter((user) => user.role === "Admin");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchUsers} />;

  return (
    <>
      {isModalOpen && (
        <AddAdminModal
          allUsers={allUsers}
          onAddAdmin={(user) => handleRoleUpdate(user, "Admin")}
          onClose={() => setIsModalOpen(false)}
          isUpdating={!!updatingUserId}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 md:p-8">
        {/* Header dengan Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            <img src="logo-kecil.png" alt="" />
          </div>
          <p className="text-gray-600">Sistem Manajemen Administrator</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-2xl rounded-3xl border border-gray-200 overflow-hidden">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    <span>👨‍💼</span>
                    Manajemen Administrator
                  </h2>
                  <div className="mt-2 flex items-center gap-4 text-emerald-100">
                    <span className="flex items-center gap-1">
                      <span>👥</span>
                      Total Admin: <strong>{adminUsers.length}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🏥</span>
                      Apotek Antares
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-emerald-600 font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span>➕</span>
                  Tambah Admin
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 rounded-2xl border-2 border-emerald-200">
                  <div className="text-emerald-600 text-2xl mb-2">👨‍⚕️</div>
                  <div className="text-emerald-800 font-bold text-lg">
                    {adminUsers.length}
                  </div>
                  <div className="text-emerald-600 text-sm">
                    Administrator Aktif
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                  <div className="text-blue-600 text-2xl mb-2">👥</div>
                  <div className="text-blue-800 font-bold text-lg">
                    {allUsers.length}
                  </div>
                  <div className="text-blue-600 text-sm">User Terdaftar</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-2xl border-2 border-purple-200">
                  <div className="text-purple-600 text-2xl mb-2">🏥</div>
                  <div className="text-purple-800 font-bold text-lg">
                    Antares
                  </div>
                  <div className="text-purple-600 text-sm">Sistem Apotek</div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <span className="flex items-center gap-2">
                        <span>👤</span>
                        Administrator
                      </span>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <span className="flex items-center gap-2">
                        <span>📧</span>
                        Email
                      </span>
                    </th>
                    <th className="py-4 px-6 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <span className="flex items-center justify-center gap-2">
                        <span>⚙️</span>
                        Aksi
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adminUsers.length > 0 ? (
                    adminUsers.map((user, index) => (
                      <tr
                        key={user.user_id}
                        className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {user.nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {user.nama}
                              </div>
                              <div className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                                <span>👑</span>
                                Administrator
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-700 flex items-center gap-2">
                            <span>📧</span>
                            {user.email}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleRoleUpdate(user, "User")}
                            disabled={updatingUserId === user.user_id}
                            className="bg-gradient-to-r from-red-400 to-pink-400 text-white font-bold py-2 px-4 rounded-xl hover:from-red-500 hover:to-pink-500 disabled:from-gray-300 disabled:to-gray-400 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:shadow-none flex items-center gap-2 mx-auto"
                          >
                            {updatingUserId === user.user_id ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                Memproses...
                              </>
                            ) : (
                              <>
                                <span>🗑️</span>
                                Hapus Admin
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-12">
                        <div className="text-6xl mb-4">👨‍💼</div>
                        <div className="text-xl text-gray-500 font-semibold">
                          Belum Ada Administrator
                        </div>
                        <div className="text-gray-400 mt-2">
                          Klik "Tambah Admin" untuk menambah administrator
                          pertama
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-white border-t">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>🏥</span>
                Apotek Antares - Sistem Manajemen Administrator
              </div>
              <button
                onClick={handleBackNavigation}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
              >
                <span>↩️</span>
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminManagement;
