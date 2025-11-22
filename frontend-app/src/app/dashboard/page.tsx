"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      setUsername(decoded.email || "User");
    } catch (error) {
      console.log("Invalid token:", error);
      router.push("/login");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md p-10 rounded-3xl w-full max-w-md shadow-2xl text-center transition-transform transform hover:scale-105">
        <h1 className="text-3xl sm:text-4xl text-white font-extrabold mb-4 tracking-wide">
          Hello {username} 👋
        </h1>

        <p className="text-gray-400 mb-10 text-lg">
          Welcome to your dashboard.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/profile")}
            className="w-full py-3 bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:scale-105 rounded-2xl text-white font-semibold text-lg transition-transform"
          >
            Profile
          </button>

          <button
            onClick={logout}
            className="w-full py-3 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:scale-105 rounded-2xl text-white font-semibold text-lg transition-transform"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
