"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";

// shadcn imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// --------------------
// TYPES
// --------------------
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

// --------------------
// MAIN PAGE
// --------------------
export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "ENGINEER", "INTERN"]}>
      <UsersContent />
    </ProtectedRoute>
  );
}

function UsersContent() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Search + Sort
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("id-asc");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Create user form
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    role: "INTERN",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);

  // -----------------------------
  // LOAD CURRENT USER + FETCH USERS
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser: User = JSON.parse(storedUser);
    setCurrentUser(parsedUser);

    // fetch users immediately
    fetchUsers(token, parsedUser);
  }, []);

  // -----------------------------
  // FETCH USERS FUNCTION
  // -----------------------------
  const fetchUsers = async (token: string, user: User) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to load users");

      const data: User[] = await res.json();

      // Non-admin can only see their own record
      const results =
        user.role !== "ADMIN" ? data.filter((u) => u.id === user.id) : data;

      setUsers(results);
      setFilteredUsers(results);
    } catch (err) {
      console.error("User load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // SEARCH + SORT
  // -----------------------------
  useEffect(() => {
    let updated = [...users];

    if (search.trim()) {
      updated = updated.filter((u) =>
        `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    updated = sortUsers(updated, sortOption);
    setFilteredUsers(updated);
    setCurrentPage(1);
  }, [search, sortOption, users]);

  const sortUsers = (list: User[], opt: string) => {
    const sorted = [...list];
    switch (opt) {
      case "id-asc":
        sorted.sort((a, b) => a.id - b.id);
        break;
      case "id-desc":
        sorted.sort((a, b) => b.id - a.id);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "role-asc":
        sorted.sort((a, b) => a.role.localeCompare(b.role));
        break;
      case "role-desc":
        sorted.sort((a, b) => b.role.localeCompare(a.role));
        break;
    }
    return sorted;
  };

  // -----------------------------
  // PAGINATION
  // -----------------------------
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // -----------------------------
  // CREATE USER
  // -----------------------------
  const handleCreateUser = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const passwordCheck =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

      if (!passwordCheck.test(form.password)) {
        throw new Error(
          "Password must contain uppercase, lowercase, number & special character."
        );
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create user");
      }

      setSuccess("User created successfully");
      setForm({ name: "", email: "", password: "", role: "INTERN" });
      fetchUsers(token, currentUser!);

      setTimeout(() => setModalOpen(false), 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // -----------------------------
  // DELETE USER
  // -----------------------------
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loading)
    return <p className="text-center text-white mt-10">Loading users...</p>;

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      {/* ------------------ LEFT SIDEBAR ------------------ */}
      <Sidebar />

      {/* ------------------ MAIN CONTENT ------------------ */}
      <main className="flex-1 p-8 ml-64">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users Management</h1>

          {currentUser?.role === "ADMIN" && (
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  + Create User
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                  <Input
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Select
                    value={form.role}
                    onValueChange={(role) => setForm({ ...form, role })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="ENGINEER">ENGINEER</SelectItem>
                      <SelectItem value="INTERN">INTERN</SelectItem>
                    </SelectContent>
                  </Select>

                  {error && <p className="text-red-400">{error}</p>}
                  {success && <p className="text-green-400">{success}</p>}

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={creating}
                    >
                      {creating ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* SEARCH + SORT */}
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 text-white placeholder-gray-400 w-64"
          />

          <Select onValueChange={setSortOption} defaultValue="id-asc">
            <SelectTrigger className="w-48 bg-gray-800 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white">
              <SelectItem value="id-asc">ID ↑</SelectItem>
              <SelectItem value="id-desc">ID ↓</SelectItem>
              <SelectItem value="name-asc">Name A–Z</SelectItem>
              <SelectItem value="name-desc">Name Z–A</SelectItem>
              <SelectItem value="role-asc">Role A–Z</SelectItem>
              <SelectItem value="role-desc">Role Z–A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <div className="rounded-lg bg-gray-800 p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.map((u) => (
                <TableRow
                  key={u.id}
                  className="border-gray-700 hover:bg-gray-700/40"
                >
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600"
                      onClick={() => router.push(`/users/edit/${u.id}`)}
                    >
                      Edit
                    </Button>

                    {currentUser?.role === "ADMIN" && (
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {paginatedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-400">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>

            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              className="border-gray-600 text-gray-300"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
