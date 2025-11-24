"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      // Safely parse JSON
      let data: any;
      try {
        data = await res.json();
      } catch (err) {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-600">
      <form
        onSubmit={handleRegister}
        className="bg-white p-0 rounded-2xl shadow-xl w-full max-w-xl"
      >
        <h2 className="text-center text-3xl font-semibold py-10 tracking-wide">
          CREATE ACCOUNT
        </h2>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}
        {success && <p className="text-center text-green-600 mb-4">{success}</p>}

        {/* Top White Box for Inputs */}
        <div className="bg-white rounded-t-2xl border border-gray-300 p-6 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-1/2 px-4 py-3 outline-none border-r border-gray-300 text-black placeholder-gray-500 bg-white dark:text-black dark:bg-white"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-1/2 px-4 py-3 outline-none border-r border-gray-300 text-black placeholder-gray-500 bg-white dark:text-black dark:bg-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-1/2 px-4 py-3 outline-none text-black placeholder-gray-500 bg-white dark:text-black dark:bg-white"
          />
        </div>

        {/* Black Register Bar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 font-bold text-lg rounded-b-2xl"
        >
          {loading ? "Registering..." : "REGISTER"}
        </button>

        <p className="text-center text-gray-700 py-6">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer font-semibold hover:underline"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
