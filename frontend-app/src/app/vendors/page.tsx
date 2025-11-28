"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
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

interface Vendor {
  id: number;
  name: string;
  companyName?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  sector?: string;
  gstNumber?: string;
}

interface Product {
  id: number;
  name: string;
  image: string;
  description?: string;
  vendorId: number;
}

interface VendorForm {
  name: string;
  companyName: string;
  contactNumber: string;
  email: string;
  address: string;
  sector: string;
  gstNumber: string;
}

export default function VendorsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <VendorsContent />
    </ProtectedRoute>
  );
}

function VendorsContent() {
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("id-asc");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [form, setForm] = useState<VendorForm>({
    name: "",
    companyName: "",
    contactNumber: "",
    email: "",
    address: "",
    sector: "MANUFACTURING",
    gstNumber: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Product detail modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // -------------------------
  // Fetch vendors + products
  // -------------------------
  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) router.push("/login");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load vendors");
      const data: Vendor[] = await res.json();
      setVendors(data);
      setFilteredVendors(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load products");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  // -------------------------
  // Search + sort
  // -------------------------
  useEffect(() => {
    let updated = [...vendors];
    if (search.trim()) {
      updated = updated.filter((v) =>
        `${v.name} ${v.companyName} ${v.email} ${v.contactNumber} ${v.sector}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }
    updated = sortVendors(updated, sortOption);
    setFilteredVendors(updated);
    setCurrentPage(1);
  }, [search, sortOption, vendors]);

  const sortVendors = (list: Vendor[], opt: string) => {
    const sorted = [...list];
    switch (opt) {
      case "id-asc": sorted.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)); break;
      case "id-desc": sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); break;
      case "name-asc": sorted.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
      case "name-desc": sorted.sort((a, b) => (b.name || "").localeCompare(a.name || "")); break;
      case "company-asc": sorted.sort((a, b) => (a.companyName || "").localeCompare(b.companyName || "")); break;
      case "company-desc": sorted.sort((a, b) => (b.companyName || "").localeCompare(a.companyName || "")); break;
    }
    return sorted;
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setVendors(vendors.filter((v) => v.id !== id));
      setFilteredVendors(filteredVendors.filter((v) => v.id !== id));
    } catch (err) {
      alert("Failed to delete vendor");
    }
  };

  if (loading) return <p className="text-center mt-10 text-white">Loading vendors...</p>;

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <main className="flex-1 p-8 pl-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vendors Management</h1>
        </div>

        <div className="rounded-lg bg-gray-800 p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-center">Details</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedVendors.map((v) => (
                <>
                  <TableRow
                    key={v.id}
                    className="border-gray-700 hover:bg-gray-700/40 cursor-pointer"
                    onClick={() =>
                      setCurrentVendor(currentVendor?.id === v.id ? null : v)
                    }
                  >
                    <TableCell>{v.companyName}</TableCell>
                    <TableCell>{v.sector}</TableCell>
                    <TableCell className="text-center">
                      {currentVendor?.id === v.id ? "▲" : "▼"}
                    </TableCell>
                  </TableRow>

                  {currentVendor?.id === v.id && (
                    <TableRow className="bg-gray-700/30 border-gray-700">
                      <TableCell colSpan={3}>
                        <div className="p-4 space-y-2 text-gray-300">
                          <p><b>Name:</b> {v.name}</p>
                          <p><b>Email:</b> {v.email}</p>
                          <p><b>Contact:</b> {v.contactNumber}</p>
                          <p><b>Address:</b> {v.address}</p>
                          <p><b>GST:</b> {v.gstNumber}</p>

                          {/* Vendor Products */}
                          <div className="mt-4">
                            <p className="font-semibold">Products:</p>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              {products.filter(p => p.vendorId === v.id).length > 0 ? (
                                products
                                  .filter(p => p.vendorId === v.id)
                                  .map((p) => (
                                    <div
                                      key={p.id}
                                      className="flex items-center gap-2 bg-gray-800 p-2 rounded cursor-pointer hover:bg-gray-700/50"
                                      onClick={() => { setSelectedProduct(p); setProductModalOpen(true); }}
                                    >
                                      <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${p.image}`}
                                        alt={p.name}
                                        width={50}
                                        height={50}
                                        className="rounded"
                                      />
                                      <span>{p.name}</span>
                                    </div>
                                  ))
                              ) : (
                                <span className="text-gray-400">No products</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="bg-yellow-500 hover:bg-yellow-600"
                              onClick={() => {}}
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(v.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}

              {paginatedVendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-400">
                    No vendors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-900"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Product Detail Modal */}
        <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle>{selectedProduct?.name}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 mt-4">
              {selectedProduct && (
                <>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${selectedProduct.image}`}
                    alt={selectedProduct.name}
                    width={200}
                    height={200}
                    className="rounded"
                  />
                  <p>{selectedProduct.description || "No description available"}</p>
                </>
              )}
            </div>

            <DialogFooter>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setProductModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
