"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userStr));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!user) return <div className="text-white text-center mt-10">Loading profile...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md p-10 rounded-3xl w-full max-w-md shadow-2xl text-center transition-transform transform hover:scale-105">
        <h1 className="text-3xl sm:text-4xl text-white font-extrabold mb-4 tracking-wide">
          Your Profile
        </h1>

        <div className="text-left text-gray-300 space-y-4 mb-6">
          <p><span className="font-bold text-white">Name:</span> {user.name}</p>
          <p><span className="font-bold text-white">Email:</span> {user.email}</p>
          <p><span className="font-bold text-white">Role:</span> {user.role}</p>
        </div>

        <button
          onClick={() => router.push("/edit-profile")}
          className="w-full py-3 mb-3 bg-blue-600 hover:bg-blue-700 hover:scale-105 rounded-2xl text-white font-semibold text-lg transition-transform"
        >
          Edit Profile
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-3 mb-3 bg-red-600 hover:bg-red-700 rounded-2xl text-white font-semibold text-lg transition-transform"
        >
          Logout
        </button>

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
