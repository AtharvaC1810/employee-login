"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // optional, if auth required

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send reset link");

      setSuccess("Reset link sent! Check your email.");
      setEmail("");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Forgot Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            className="bg-gray-700 border-gray-600 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="text-red-400">{error}</p>}
          {success && <p className="text-green-400">{success}</p>}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-gray-400 mt-4 text-center text-sm">
          Remembered your password?{" "}
          <button
            type="button"
            className="text-blue-400 underline"
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
