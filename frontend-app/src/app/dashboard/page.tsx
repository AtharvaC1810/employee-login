"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      setUsername(decoded.email || "User");
      const user = JSON.parse(userData);
      setRole(user.role || "");
    } catch (error) {
      console.log("Invalid token:", error);
      router.push("/login");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8">
          Hello {username} 👋
        </h1>

        <p className="text-gray-300 mb-10 text-lg">
          Welcome to your dashboard. Select an option below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div
            onClick={() => router.push("/profile")}
            className="cursor-pointer bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-2xl shadow-lg p-6 text-white hover:scale-105 transition-transform"
          >
            <h2 className="text-xl font-bold mb-2">Profile</h2>
            <p className="text-gray-200">View and edit your profile</p>
          </div>

          {/* User Management Card - Admin Only */}
          {role === "ADMIN" && (
            <div
              onClick={() => router.push("/users")}
              className="cursor-pointer bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-2xl shadow-lg p-6 text-white hover:scale-105 transition-transform"
            >
              <h2 className="text-xl font-bold mb-2">User Management</h2>
              <p className="text-gray-200">View, create, edit, and delete users</p>
            </div>
          )}

          {/* Logout Card */}
          <div
            onClick={logout}
            className="cursor-pointer bg-gray-700 rounded-2xl shadow-lg p-6 text-white hover:bg-gray-800 hover:scale-105 transition-transform"
          >
            <h2 className="text-xl font-bold mb-2">Logout</h2>
            <p className="text-gray-300">Sign out of your account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
