"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function EditProfile() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setForm({
        name: userData.name || "",
        email: userData.email || "",
        password: ""
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      await axios.patch(
        `${backend}/auth/update-profile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem(
        "user",
        JSON.stringify({ name: form.name, email: form.email })
      );

      alert("Profile updated successfully!");
      router.push("/profile");
    } catch (err) {
      console.log(err);
      alert("Error updating profile");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 bg-opacity-90 backdrop-blur-md p-10 rounded-3xl w-full max-w-md shadow-2xl text-center transition-transform transform hover:scale-105"
      >
        <h1 className="text-3xl sm:text-4xl text-white font-extrabold mb-6 tracking-wide">
          Edit Profile
        </h1>

        {/* Name */}
        <div className="text-left mb-6">
          <label className="text-gray-300 font-semibold mb-2 block">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-600 outline-none transition"
          />
        </div>

        {/* Email */}
        <div className="text-left mb-6">
          <label className="text-gray-300 font-semibold mb-2 block">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-600 outline-none transition"
          />
        </div>

        {/* Password */}
        <div className="text-left mb-8">
          <label className="text-gray-300 font-semibold mb-2 block">
            New Password (optional)
          </label>
          <input
            type="password"
            name="password"
            placeholder="Leave blank if unchanged"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-600 outline-none transition"
          />
        </div>

        {/* Save Button */}
        <button
          disabled={loading}
          className="w-full py-3 mb-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl text-white text-lg font-semibold hover:scale-105 transition-transform"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>

        {/* Cancel */}
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-2xl text-white text-lg font-semibold hover:scale-105 transition-transform"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
