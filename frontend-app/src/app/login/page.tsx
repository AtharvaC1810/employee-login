"use client";

import { useState } from "react";
import { apiRequest } from "../../utils/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiRequest("/login", "POST", form);

      const token = res.access_token;
      if (!token) {
        setError("No token received from server");
        return;
      }

      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 bg-opacity-90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-1/2 max-w-md transition-transform transform hover:scale-105"
      >
        <h2 className="text-3xl font-extrabold text-white mb-8 text-center tracking-wide">
          Login
        </h2>

        {error && (
          <p className="bg-red-700 bg-opacity-60 text-red-100 py-2 px-4 rounded text-center mb-4 animate-pulse">
            {error}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full mb-4 px-5 py-3 rounded-2xl bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full mb-6 px-5 py-3 rounded-2xl bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-2xl text-white font-bold text-lg transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:scale-105"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-gray-400 mt-6 text-center">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-pink-400 hover:underline cursor-pointer font-semibold"
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
