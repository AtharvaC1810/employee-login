"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "" });

  // Load user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md p-10 rounded-3xl w-full max-w-md shadow-2xl text-center transition-transform transform hover:scale-105">
        
        <h1 className="text-3xl sm:text-4xl text-white font-extrabold mb-4 tracking-wide">
          Your Profile
        </h1>

        <p className="text-gray-400 mb-10 text-lg">
          Here are your account details
        </p>

        {/* User Details */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-inner mb-8">
          <p className="text-gray-300 text-lg">
            <span className="font-semibold text-white">Name:</span> {user.name}
          </p>
          <p className="text-gray-300 text-lg mt-3">
            <span className="font-semibold text-white">Email:</span> {user.email}
          </p>
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => router.push("/profile/edit")}
          className="w-full py-3 mb-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:scale-105 rounded-2xl text-white font-semibold text-lg transition-transform"
        >
          Edit Profile
        </button>

        {/* Back to Dashboard */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:scale-105 rounded-2xl text-white font-semibold text-lg transition-transform"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
