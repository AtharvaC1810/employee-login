"use client";

import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-md p-10 rounded-3xl w-full max-w-md shadow-2xl text-center transition-transform transform hover:scale-105">
        <h1 className="text-3xl sm:text-4xl text-white font-extrabold mb-4 tracking-wide">
          Your Profile
        </h1>

        <p className="text-gray-400 mb-10 text-lg">
          More details coming soon...
        </p>

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
