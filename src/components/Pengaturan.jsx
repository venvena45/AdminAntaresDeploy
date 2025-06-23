import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// --- Komponen-Komponen UI ---

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    <p className="mt-4 text-lg text-gray-600">Memuat data...</p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-center p-4">
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md"
      role="alert"
    >
      <strong className="font-bold block text-lg">Terjadi Kesalahan!</strong>
      <span className="block mt-2">
        {message || "Tidak dapat memuat data."}
      </span>
      <button
        onClick={onRetry}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
      >
        Coba Lagi
      </button>
    </div>
  </div>
);

// --- Komponen Modal untuk Menambah Admin ---

const AddAdminModal = ({ allUsers, onAddAdmin, onClose, isUpdating }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter untuk mencari pengguna yang BUKAN admin
  const potentialAdmins = useMemo(() => {
    if (!searchTerm) return [];
    return allUsers.filter(
      (user) =>
        user.role !== "Admin" &&
        (user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, allUsers]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Tambah Admin Baru</h3>
          <p className="text-sm text-gray-500">
            Cari pengguna untuk dijadikan admin.
          </p>
        </div>
        <div className="p-4">
          <input
            type="text"
            placeholder="Ketik nama atau email untuk mencari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="max-h-60 overflow-y-auto border-t">
          {potentialAdmins.length > 0 ? (
            <ul>
              {potentialAdmins.map((user) => (
                <li
                  key={user.user_id}
                  className="flex justify-between items-center p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">{user.nama}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => onAddAdmin(user)}
                    disabled={isUpdating}
                    className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-green-600 disabled:bg-gray-300"
                  >
                    Jadikan Admin
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-gray-500">
              {searchTerm
                ? "Pengguna tidak ditemukan atau sudah menjadi admin."
                : "Silakan mulai mencari."}
            </p>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
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
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = "https://antaresapi-production.up.railway.app/api";

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
      newRole === "Admin" ? "menjadikan admin" : "menghapus admin";
    const confirmMessage = `Apakah Anda yakin ingin ${actionText} untuk pengguna ${user.nama}?`;

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

        // Update state lokal untuk merefleksikan perubahan
        setAllUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.user_id === user.user_id ? { ...u, role: newRole } : u
          )
        );

        alert(`Pengguna ${user.nama} berhasil diubah menjadi ${newRole}.`);
        if (newRole === "Admin") setIsModalOpen(false); // Tutup modal jika berhasil tambah admin
      } catch (err) {
        alert(`Gagal mengubah role. Kesalahan: ${err.message}`);
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  // Filter untuk mendapatkan daftar admin saat ini
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

      <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Manajemen Admin</h2>
              <p className="text-sm text-gray-500">
                Total: {adminUsers.length} admin aktif
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition"
            >
              + Tambah Admin
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminUsers.length > 0 ? (
                  adminUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                        {user.nama}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleRoleUpdate(user, "User")}
                          disabled={updatingUserId === user.user_id}
                          className="bg-red-100 text-red-800 text-xs font-semibold py-1 px-3 rounded-full hover:bg-red-200 disabled:opacity-50"
                        >
                          {updatingUserId === user.user_id
                            ? "Menyimpan..."
                            : "Hapus Admin"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      Belum ada pengguna yang menjadi admin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center flex-wrap gap-4 py-4 px-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white py-2 px-5 rounded-lg shadow hover:bg-gray-600 transition"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminManagement;
