import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "https://antaresapi-production.up.railway.app/api/auth/login";

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user)); // opsional
        navigate("/");
      } else {
        setError(
          data.message ||
            "Login gagal. Periksa kembali email dan password Anda."
        );
      }
    } catch (err) {
      console.error("Login API Error:", err);
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-200 font-sans">
      <header className="bg-teal-700 text-white text-center py-4 font-bold text-lg">
        APOTEK ANTARES
      </header>
      <main className="flex flex-grow items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h2 className="text-center text-lg font-bold mb-6">ADMIN LOG IN</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2"
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2"
              disabled={loading}
              required
            />
            <button
              type="submit"
              className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600 disabled:bg-orange-300"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Log in"}
            </button>
          </form>
        </div>
      </main>
      <footer className="bg-teal-700 text-white text-center py-4 text-sm">
        © 2025 APOTEK ANTARES. All Rights Reserved.
      </footer>
    </div>
  );
}
