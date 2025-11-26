"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      const user = data.data?.user || data.user; 
      const token = data.data?.access_token || data.access_token;

      if (!token || !user) throw new Error("Invalid login response");

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-700 to-blue-600 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 tracking-wide">
          ACCOUNT LOGIN
        </h1>

        <form onSubmit={handleLogin}>
          <div className="flex w-full border border-gray-300 rounded-t-xl overflow-hidden">
            <input
              type="email"
              name="email"
              placeholder="User Email Id"
              value={form.email}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 outline-none border-r border-gray-300 text-black placeholder-gray-500 bg-white"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-3 outline-none text-black placeholder-gray-500 bg-white"
            />
          </div>

          {error && (
            <p className="text-red-600 mt-3 mb-1 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 font-semibold tracking-wider rounded-b-xl hover:bg-gray-800 transition"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-700">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-blue-600 cursor-pointer font-semibold hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
