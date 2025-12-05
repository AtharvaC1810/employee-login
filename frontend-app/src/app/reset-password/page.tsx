"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); 

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) return;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setSuccess("Password reset successful! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New Password"
            className="bg-gray-700 border-gray-600 text-white"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Confirm New Password"
            className="bg-gray-700 border-gray-600 text-white"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-400">{error}</p>}
          {success && <p className="text-green-400">{success}</p>}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading || !token}
          >
            {loading ? "Resetting..." : "Reset Password"}
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
