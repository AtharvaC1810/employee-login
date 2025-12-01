"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params?.id); // FIX: convert once

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "INTERN",
  });

  // ----------------------------------------------------
  // LOAD LOGGED IN USER
  // ----------------------------------------------------
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) setCurrentUser(JSON.parse(data));
  }, []);

  // ----------------------------------------------------
  // FETCH USER TO EDIT
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchUser() {
      try {
        if (!userId) return;

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to fetch user");
        }

        const data = await res.json();

        setForm({
          name: data.name,
          email: data.email,
          password: "",
          role: data.role,
        });
      } catch (err: any) {
        setError(err.message || "Error fetching user");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  // ----------------------------------------------------
  // FORM CHANGE HANDLER
  // ----------------------------------------------------
  const handleChange = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ----------------------------------------------------
  // SUBMIT HANDLER
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      let payload: any = {
        name: form.name,
        email: form.email,
      };

      // Only include password if user typed something meaningful
      if (form.password.trim().length > 0) {
        payload.password = form.password.trim();
      }

      // Only admins can update roles
      if (currentUser?.role === "ADMIN") {
        payload.role = form.role;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update user");
      }

      // Update local storage if editing self
      if (currentUser?.id === userId) {
        const updatedUser = { ...currentUser, ...payload };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      router.push("/users");
    } catch (err: any) {
      setError(err.message || "Error updating user");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center mt-10">Loading...</div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Edit User</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-800 text-white"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-800 text-white"
        />

        <input
          type="password"
          name="password"
          placeholder="New Password (optional)"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-800 text-white"
        />

        {/* Only Admin can change user roles */}
        {currentUser?.role === "ADMIN" && (
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
          >
            <option value="INTERN">Intern</option>
            <option value="ENGINEER">Engineer</option>
            <option value="ADMIN">Admin</option>
          </select>
        )}

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update User"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/users")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
