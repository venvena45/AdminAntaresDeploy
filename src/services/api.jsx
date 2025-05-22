// src/api.jsx

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch all orders from API
 */
export const getPesanan = async () => {
  try {
    const response = await fetch(`${BASE_URL}/pesanan`);
    if (!response.ok) {
      throw new Error("Gagal mengambil data pesanan");
    }
    return await response.json();
  } catch (error) {
    console.error("Error saat mengambil data:", error);
    throw error;
  }
};
