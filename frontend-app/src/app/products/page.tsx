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

// --------------------------------------
// Interfaces (Fixed)
// --------------------------------------
interface Vendor {
  id: number;
  company_name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  vendorId: number;
  vendor?: Vendor;
  image?: string;
}

// --------------------------------------
// Page with Auth
// --------------------------------------
export default function ProductsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <ProductsContent />
    </ProtectedRoute>
  );
}

// --------------------------------------
// Products Page Logic
// --------------------------------------
function ProductsContent() {
  const router = useRouter();

  // Vendors
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Search + Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Dialog state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    vendorId: "",
    description: "",
    image: null as File | null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------
  // Fetch vendors
  // --------------------------------------
  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load vendors");

      const data = await res.json();
      setVendors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVendors(false);
    }
  };

  // --------------------------------------
  // Fetch products
  // --------------------------------------
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load products");

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  // --------------------------------------
  // Search + Pagination
  // --------------------------------------
  const filtered = products.filter((p) =>
    `${p.name} ${p.description} ${p.vendor?.company_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // --------------------------------------
  // Create Product
  // --------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("vendorId", form.vendorId.toString());

      if (form.image) fd.append("image", form.image);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        body: fd,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create product");
      }

      setSuccess("Product created successfully!");

      setForm({
        name: "",
        vendorId: "",
        description: "",
        image: null,
      });

      fetchProducts();
      setTimeout(() => setModalOpen(false), 800);
    } catch (err: any) {
      setError(err.message || "Error creating product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingVendors || loadingProducts)
    return <p className="text-center mt-10 text-white">Loading...</p>;

  // --------------------------------------
  // UI
  // --------------------------------------
  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar />

      <main className="flex-1 p-8 pl-64">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products</h1>

          <div className="flex items-center gap-3">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-400"
            />

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">+ Add Product</Button>
              </DialogTrigger>

              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle>Add Product</DialogTitle>
                </DialogHeader>

                {/* PRODUCT FORM */}
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <Input
                    placeholder="Product Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />

                  {/* Vendor Select */}
                  <Select
                    value={form.vendorId}
                    onValueChange={(v) => setForm({ ...form, vendorId: v })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>

                    <SelectContent className="bg-gray-900 text-white border-gray-700">
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/vendors")}
                  >
                    + Add New Vendor
                  </Button>

                  <Input
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })}
                    className="bg-gray-800 border-gray-700 text-white p-2"
                  />

                  {/* MESSAGES */}
                  {error && <p className="text-red-400">{error}</p>}
                  {success && <p className="text-green-400">{success}</p>}

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Create Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-lg bg-gray-800 p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead>Name</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Image</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((p) => (
                <TableRow key={p.id} className="border-gray-700">
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.vendor?.company_name}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell>
                    {p.image && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${p.image}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-gray-400">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <span className="text-gray-300">Page {currentPage} of {totalPages}</span>

            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
