"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

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

// -----------------------------
// INTERFACES
// -----------------------------
interface Vendor {
  id: number;
  name: string;
  companyName?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  vendorId: number;
  vendorName: string;
  image: string;
}

// -----------------------------
// MAIN COMPONENT
// -----------------------------
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
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("id-asc");

  const [modalOpen, setModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [form, setForm] = useState({
    name: "",
    price: "",
    vendorId: "",
    image: null as File | null,
  });

  const [vendorForm, setVendorForm] = useState({
    name: "",
    companyName: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vendorError, setVendorError] = useState("");
  const [vendorSuccess, setVendorSuccess] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);

  // ----------------------------
  // INITIAL LOAD
  // ----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    setCurrentUser(JSON.parse(user));
    loadData(token);
  }, []);

  // ----------------------------
  // LOAD VENDORS + PRODUCTS
  // ----------------------------
  const loadData = async (token: string) => {
    try {
      // Fetch vendors
      const vendorRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!vendorRes.ok) throw new Error("Failed to fetch vendors");
      const vendorData: Vendor[] = await vendorRes.json();
      setVendors(vendorData);

      // Create vendor map
      const vendorMap: Record<number, string> = {};
      vendorData.forEach((v) => {
        vendorMap[v.id] = v.companyName || v.name;
      });

      // Fetch products
      const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!productRes.ok) throw new Error("Failed to fetch products");
      const productData = await productRes.json();

      const productsArray: Product[] = Array.isArray(productData)
        ? productData
        : productData.products;

      const updatedProducts = productsArray.map((p: Product) => ({
        ...p,
        vendorName: vendorMap[p.vendorId] || "Unknown",
      }));

      setProducts(updatedProducts);
      setFiltered(updatedProducts);
    } catch (err) {
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // CREATE PRODUCT
  // ----------------------------
  const handleCreateProduct = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!form.name || !form.price || !form.vendorId)
        throw new Error("Name, price, and vendor are required");

      const token = localStorage.getItem("token");

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", Number(form.price).toString());
      fd.append("vendorId", Number(form.vendorId).toString());
      if (form.image) fd.append("image", form.image);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create product");
      }

      setSuccess("Product created successfully");
      setForm({ name: "", price: "", vendorId: "", image: null });

      await loadData(token);
      setTimeout(() => setModalOpen(false), 800);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ----------------------------
  // CREATE VENDOR
  // ----------------------------
  const handleCreateVendor = async (e: any) => {
    e.preventDefault();
    setVendorError("");
    setVendorSuccess("");

    try {
      if (!vendorForm.name || !vendorForm.companyName)
        throw new Error("Name + Company required");

      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vendorForm),
      });

      if (!res.ok) throw new Error("Failed to create vendor");

      setVendorSuccess("Vendor created");
      setVendorForm({ name: "", companyName: "" });

      await loadData(token);
      setTimeout(() => setVendorModalOpen(false), 800);
    } catch (err: any) {
      setVendorError(err.message);
    }
  };

  // ----------------------------
  // DELETE PRODUCT
  // ----------------------------
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  // ----------------------------
  // SEARCH + SORT
  // ----------------------------
  useEffect(() => {
    let updated = [...products];
    if (search.trim()) {
      updated = updated.filter((p) =>
        `${p.name} ${p.price} ${p.vendorName}`.toLowerCase().includes(search.toLowerCase())
      );
    }
    updated = sortProducts(updated);
    setFiltered(updated);
    setCurrentPage(1);
  }, [search, sortOption, products]);

  const sortProducts = (list: Product[]) => {
    const sorted = [...list];
    switch (sortOption) {
      case "id-asc": sorted.sort((a, b) => a.id - b.id); break;
      case "id-desc": sorted.sort((a, b) => b.id - a.id); break;
      case "name-asc": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
      case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
    }
    return sorted;
  };

  // ----------------------------
  // PAGINATION
  // ----------------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ----------------------------
  // RENDER
  // ----------------------------
  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-8 pl-64">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products Management</h1>

          {currentUser?.role === "ADMIN" && (
            <>
              {/* CREATE PRODUCT BUTTON + MODAL */}
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">+ Add Product</Button>
                </DialogTrigger>

                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <Input
                      placeholder="Name"
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

                    <Input
                      type="file"
                      accept="image/*"
                      className="bg-gray-800 border-gray-700"
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.files?.[0] || null })
                      }
                    />

                    <Select
                      value={form.vendorId}
                      onValueChange={(value) => {
                        if (value === "new") setVendorModalOpen(true);
                        else setForm({ ...form, vendorId: value });
                      }}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select Vendor" />
                      </SelectTrigger>

                      <SelectContent className="bg-gray-800">
                        {vendors.map((v) => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            {v.companyName || v.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">+ Add Vendor</SelectItem>
                      </SelectContent>
                    </Select>

                    {error && <p className="text-red-400">{error}</p>}
                    {success && <p className="text-green-400">{success}</p>}

                    <DialogFooter>
                      <Button className="bg-blue-600 hover:bg-blue-700">Create</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* CREATE VENDOR MODAL */}
              <Dialog open={vendorModalOpen} onOpenChange={setVendorModalOpen}>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Add Vendor</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleCreateVendor} className="space-y-4">
                    <Input
                      placeholder="Contact Person Name"
                      className="bg-gray-800 border-gray-700"
                      value={vendorForm.name}
                      onChange={(e) =>
                        setVendorForm({ ...vendorForm, name: e.target.value })
                      }
                    />

                    <Input
                      placeholder="Company Name"
                      className="bg-gray-800 border-gray-700"
                      value={vendorForm.companyName}
                      onChange={(e) =>
                        setVendorForm({ ...vendorForm, companyName: e.target.value })
                      }
                    />

                    {vendorError && <p className="text-red-400">{vendorError}</p>}
                    {vendorSuccess && <p className="text-green-400">{vendorSuccess}</p>}

                    <DialogFooter>
                      <Button className="bg-blue-600 hover:bg-blue-700">Create Vendor</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* SEARCH + SORT */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search products..."
            className="bg-gray-800 border-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="id-asc">ID ↑</SelectItem>
              <SelectItem value="id-desc">ID ↓</SelectItem>
              <SelectItem value="name-asc">Name ↑</SelectItem>
              <SelectItem value="name-desc">Name ↓</SelectItem>
              <SelectItem value="price-asc">Price ↑</SelectItem>
              <SelectItem value="price-desc">Price ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <div className="rounded-lg bg-gray-800 p-4 mt-4">
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
                    {p.image && (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${p.image}`}
                        alt="product"
                        width={50}
                        height={50}
                        className="rounded"
                      />
                    )}
                  </TableCell>

                  <TableCell>{p.name}</TableCell>
                  <TableCell>₹{p.price}</TableCell>
                  <TableCell>{p.vendorName}</TableCell>

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
                  <TableCell colSpan={6} className="text-center text-gray-400 py-4">
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
              className="border-gray-600"
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
              className="border-gray-600"
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
