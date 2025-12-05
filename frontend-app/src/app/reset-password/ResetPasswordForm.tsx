"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("https://employee-login-fs5m.onrender.com/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setMessage(data.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        {!token ? (
          <p className="text-red-500 text-sm">Invalid or missing token.</p>
        ) : (
          <>
            <input
              type="password"
              placeholder="New Password"
              className="border p-2 rounded w-full mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded w-full"
            >
              Reset Password
            </button>
          </>
        )}

        <p className="text-sm mt-2 text-center">{message}</p>
      </form>
    </div>
  );
}
