"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Permission {
  id: number;
  name: string;
  description?: string;
}

export default function PermissionsPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPerm, setNewPerm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch permissions");
      setPermissions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Add new permission
  const handleAdd = async () => {
    try {
      if (!newPerm.name) throw new Error("Name is required");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPerm),
      });
      if (!res.ok) throw new Error("Failed to create permission");
      setNewPerm({ name: "", description: "" });
      fetchPermissions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete permission
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete permission");
      fetchPermissions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">Permissions Management</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add Permission */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="Permission Name"
          value={newPerm.name}
          onChange={(e) => setNewPerm({ ...newPerm, name: e.target.value })}
          className="p-2 rounded bg-gray-800 text-white flex-1"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newPerm.description}
          onChange={(e) => setNewPerm({ ...newPerm, description: e.target.value })}
          className="p-2 rounded bg-gray-800 text-white flex-1"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-white font-semibold"
        >
          Add
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-gray-800 text-white p-5 rounded-xl shadow-xl space-y-2">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              className="border-b border-gray-700 py-2 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{perm.name}</p>
                <p className="text-gray-400 text-sm">{perm.description || "No description"}</p>
              </div>
              <button
                onClick={() => handleDelete(perm.id)}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
