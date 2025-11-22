"use client";

import { useState } from "react";
import { apiRequest } from "../../utils/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      };

      if (!payload.email) throw new Error("Email is required");

      const res = await apiRequest("/register", "POST", payload);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <form
        onSubmit={handleRegister}
        className="bg-gray-900 bg-opacity-90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-1/2 max-w-md transition-transform transform hover:scale-105"
      >
        <h2 className="text-3xl font-extrabold text-white mb-8 text-center tracking-wide">
          Create Account
        </h2>

        {error && (
          <p className="bg-red-700 bg-opacity-60 text-red-100 py-2 px-4 rounded text-center mb-4 animate-pulse">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-700 bg-opacity-60 text-green-100 py-2 px-4 rounded text-center mb-4 animate-pulse">
            {success}
          </p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full mb-4 px-5 py-3 rounded-2xl bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500 transition"
        />

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
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-gray-400 mt-6 text-center">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-pink-400 hover:underline cursor-pointer font-semibold"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
