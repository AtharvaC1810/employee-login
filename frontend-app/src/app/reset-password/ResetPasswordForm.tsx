"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter(); // ✅ for redirect
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid or missing token.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://employee-login-fs5m.onrender.com/forgot-password/reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        // ✅ redirect to login after short delay
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-lg shadow-md w-full max-w-md"
      >
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
              required
              minLength={6}
            />

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded w-full"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <p className="text-sm mt-2 text-center">{message}</p>
      </form>
    </div>
  );
}
