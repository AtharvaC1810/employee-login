"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

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
import Image from "next/image";

interface Vendor {
  id: number;
  name: string;
  companyName?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  vendor?: Vendor;
}

export default function ProductsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "ENGINEER", "INTERN"]}>
      <ProductsContent />
    </ProtectedRoute>
  );
}

function ProductsContent() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("id-asc");

  const [modalOpen, setModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [form, setForm] = useState({
    name: "",
    price: "",
    image: null as File | null,
    vendorId: "" as string,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);

  // ---------------------
  // Load user + fetch products + vendors
  // ---------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setCurrentUser(JSON.parse(userData));
    fetchProducts(token);
    fetchVendors(token);
  }, []);

  const fetchProducts = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch vendors");
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setVendors([]);
    }
  };

  // ---------------------
  // Search + Sort
  // ---------------------
  useEffect(() => {
    let updated = [...products];
    if (search.trim()) {
      updated = updated.filter((p) =>
        `${p.name} ${p.price} ${p.vendor?.name}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }
    updated = sortProducts(updated, sortOption);
    setFiltered(updated);
    setCurrentPage(1);
  }, [search, sortOption, products]);

  const sortProducts = (list: Product[], opt: string) => {
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
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
    }
    return sorted;
  };

  // ---------------------
  // Pagination
  // ---------------------
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = Array.isArray(filtered)
    ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];

  // ---------------------
  // Create Product
  // ---------------------
  const handleCreateProduct = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!form.name || !form.price || !form.image || !form.vendorId) {
        throw new Error("All fields required including vendor and image");
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("image", form.image);
      fd.append("vendorId", form.vendorId);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to create product");

      setSuccess("Product created successfully");
      setForm({ name: "", price: "", image: null, vendorId: "" });
      fetchProducts(token);

      setTimeout(() => setModalOpen(false), 1200);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ---------------------
  // Delete Product
  // ---------------------
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error deleting");

      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products Management</h1>

          {currentUser?.role === "ADMIN" && (
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  + Add Product
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateProduct} className="space-y-4 mt-4">
                  <Input
                    placeholder="Product Name"
                    className="bg-gray-800 border-gray-700"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    className="bg-gray-800 border-gray-700"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />

                  {/* Vendor Dropdown */}
                  <Select
                    onValueChange={(val) => {
                      if (val === "new") router.push("/vendors/new");
                      else setForm({ ...form, vendorId: val });
                    }}
                    value={form.vendorId}
                  >
                    <SelectTrigger className="w-full bg-gray-800 text-white">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white">
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.companyName || v.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add New Vendor</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="file"
                    accept="image/*"
                    className="bg-gray-800 border-gray-700"
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.files?.[0] || null })
                    }
                  />

                  {error && <p className="text-red-400">{error}</p>}
                  {success && <p className="text-green-400">{success}</p>}

                  <DialogFooter>
                    <Button className="bg-blue-600 hover:bg-blue-700">Create</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* SEARCH + SORT */}
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 text-white w-64"
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
              <SelectItem value="price-asc">Price ↑</SelectItem>
              <SelectItem value="price-desc">Price ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <div className="rounded-lg bg-gray-800 p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead>ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((p) => (
                <TableRow key={p.id} className="border-gray-700">
                  <TableCell>{p.id}</TableCell>
                  <TableCell>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${p.image}`}
                      alt="product"
                      width={50}
                      height={50}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>₹{p.price}</TableCell>
                  <TableCell>{p.vendor?.companyName || p.vendor?.name || "-"}</TableCell>
                  <TableCell className="text-center">
                    {currentUser?.role === "ADMIN" && (
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-400">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-900"
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
              className="border-gray-600 text-gray-900"
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
