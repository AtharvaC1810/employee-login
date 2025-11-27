"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const storedToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!storedToken || !userData) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
    const user = JSON.parse(userData);
    setRole(user.role?.toUpperCase());
  }, [router]);

  const fetchPermissions = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load permissions");

      const data = await res.json();
      setPermissions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPermissions();
  }, [token]);

  const handleAdd = async () => {
    if (!newPerm.name) return setError("Permission name is required!");

    try {
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
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this permission?")) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchPermissions();
  };

  if (!isClient) return null;

  if (role !== "ADMIN") {
    return (
      <div className="text-center text-xl mt-20 text-red-400">
        Access Denied
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <h1 className="text-3xl font-bold mb-6 text-white">Permissions</h1>

      <Card className="mb-6 bg-gray-900 border border-gray-700">
        <CardContent className="p-4 flex gap-3">
          <Input
            placeholder="Permission Name"
            value={newPerm.name}
            onChange={(e) => setNewPerm({ ...newPerm, name: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Input
            placeholder="Description"
            value={newPerm.description}
            onChange={(e) =>
              setNewPerm({ ...newPerm, description: e.target.value })
            }
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAdd}>
            Add
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 space-y-3">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="flex justify-between border-b border-gray-700 pb-2 text-white"
              >
                <div>
                  <p className="font-semibold text-white">{perm.name}</p>
                  <p className="text-gray-400 text-sm">{perm.description || "No description"}</p>
                </div>
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(perm.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
            {permissions.length === 0 && (
              <p className="text-gray-400 text-center py-4">No permissions found.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
