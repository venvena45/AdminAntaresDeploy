import React from "react";
import { useNavigate } from "react-router-dom";

export default function App() {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-200 font-sans">
            {/* Header */}
            <header className="bg-teal-700 text-white text-center py-4 font-bold text-lg">
                APOTEK ANTARES
            </header>

            {/* Body */}
            <main className="flex flex-grow items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md md:max-w-lg">

                    {/* Right: Form */}
                    <div className="w-full">
                        <h2 className="text-center text-lg font-bold mb-6">LOG IN</h2>
                        <form className="flex flex-col gap-4">
                            <input
                                type="email"
                                placeholder="Email"
                                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                            />
                            <button
                                type="submit"
                                className="bg-orange-500 text-white py-2 rounded font-semibold hover:bg-orange-600 transition duration-300 w-full"
                            >
                                Log in
                            </button>
                            <p className="text-sm text-center mt-2">
                                Belum punya akun?{" "}
                                <a href="#" className="text-blue-500 hover:underline">
                                    Registrasi disini
                                </a>
                            </p>
                        </form>
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
