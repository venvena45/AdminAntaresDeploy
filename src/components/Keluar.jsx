import React from "react";
import { useNavigate } from "react-router-dom";

export default function App() {
    const navigate = useNavigate(); // Panggil useNavigate di dalam komponen

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-200">
            {/* Header */}
            <header className="bg-teal-700 text-white text-center py-4 font-bold text-lg">
                APOTEK ANTARES
            </header>

            {/* Modal */}
            <main className="flex-grow flex items-center justify-center">
                <div className="bg-white shadow-md rounded-lg p-6 text-center w-80">
                    <p className="mb-6 text-lg font-medium">Apakah Anda Yakin<br />Ingin Keluar?</p>
                    <div className="flex justify-between px-6">
                        <button onClick={() => {
                            console.log("Navigasi ke /login");
                            navigate("/login");
                        }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700">
                            Yakin
                        </button>


                        <button onClick={() => navigate("/")}
                            className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700">
                            Tidak
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-teal-700 text-white py-4 px-8 text-sm">
                <div className="flex justify-between flex-wrap">
                    {/* Kontak */}
                    <div>
                        <h3 className="font-semibold mb-1">Kontak</h3>
                        <p>📞 +62 852-456 7800</p>
                        <p>📧 info@apotekantares.com</p>
                        <p>📍 Jl. Kesehatan No.123, Jakarta</p>
                    </div>
                    {/* Jam Operasi */}
                    <div>
                        <h3 className="font-semibold mb-1">Jam Operasi</h3>
                        <p>📅 Senin - Minggu</p>
                        <p>🕘 07:00 - 21:00</p>
                    </div>
                </div>
                <div className="text-center mt-4">
                    © 2025 APOTEK ANTARES. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
}
