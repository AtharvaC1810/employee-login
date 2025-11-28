"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

// shadcn imports (same as your users page)
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
  status?: string;
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
  // Only ADMIN should manage vendors in most setups — adjust allowedRoles if needed
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
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  // Search + Sort
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("id-asc");

  // Modal (create / edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Create / Edit form
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

  // LOAD CURRENT USER (for possible role-based filtering later)
  useEffect(() => {
    const stored = localStorage.getItem("user");
    // we don't strictly need the user here, but keep pattern consistent
    // const parsed = stored ? JSON.parse(stored) : null;
    // setCurrentUser(parsed);
  }, []);

  // FETCH ALL VENDORS
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to load vendors");
      const data: Vendor[] = await res.json();

      setVendors(data);
      setFilteredVendors(data);
    } catch (err: any) {
      console.error("Vendor load error:", err);
      setError(err.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SEARCH + SORT + FILTER
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

  // SORT FUNCTION
  const sortVendors = (list: Vendor[], opt: string) => {
    const sorted = [...list];
    switch (opt) {
      case "id-asc":
        sorted.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        break;
      case "id-desc":
        sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "company-asc":
        sorted.sort((a, b) => (a.companyName || "").localeCompare(b.companyName || ""));
        break;
      case "company-desc":
        sorted.sort((a, b) => (b.companyName || "").localeCompare(a.companyName || ""));
        break;
    }
    return sorted;
  };

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // OPEN MODAL FOR CREATE
  const openCreateModal = () => {
    setIsEditMode(false);
    setForm({
      name: "",
      companyName: "",
      contactNumber: "",
      email: "",
      address: "",
      sector: "MANUFACTURING",
      gstNumber: "",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // OPEN MODAL FOR EDIT
  const openEditModal = (vendor: Vendor) => {
    setIsEditMode(true);
    setCurrentVendor(vendor);
    setForm({
      name: vendor.name || "",
      companyName: vendor.companyName || "",
      contactNumber: vendor.contactNumber || "",
      email: vendor.email || "",
      address: vendor.address || "",
      sector: vendor.sector || "MANUFACTURING",
      gstNumber: vendor.gstNumber || "",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // CREATE or UPDATE vendor
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // basic validation
      if (!form.name.trim()) throw new Error("Vendor name is required");
      if (!form.companyName.trim()) throw new Error("Company name is required");
      // optional: validate GST format if needed

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const payload = {
        name: form.name,
        companyName: form.companyName,
        contactNumber: form.contactNumber,
        email: form.email,
        address: form.address,
        sector: form.sector,
        gstNumber: form.gstNumber,
      };

      let res: Response;
      if (isEditMode && currentVendor) {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/${currentVendor.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save vendor");
      }

      setSuccess(isEditMode ? "Vendor updated successfully" : "Vendor created successfully");
      fetchVendors();
      setTimeout(() => setModalOpen(false), 900);
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE VENDOR
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to delete vendor");
      setVendors(vendors.filter((v) => v.id !== id));
      setFilteredVendors(filteredVendors.filter((v) => v.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete vendor");
    }
  };

  // LOADING
  if (loading) return <p className="text-center text-white mt-10">Loading vendors...</p>;

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 p-8 pl-64">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vendors Management</h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-800 text-white placeholder-gray-400"
              />

              <Select onValueChange={setSortOption} defaultValue="id-asc">
                <SelectTrigger className="w-44 bg-gray-800 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  <SelectItem value="id-asc">ID ↑</SelectItem>
                  <SelectItem value="id-desc">ID ↓</SelectItem>
                  <SelectItem value="name-asc">Name A–Z</SelectItem>
                  <SelectItem value="name-desc">Name Z–A</SelectItem>
                  <SelectItem value="company-asc">Company A–Z</SelectItem>
                  <SelectItem value="company-desc">Company Z–A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateModal}>
                  + Create Vendor
                </Button>
              </DialogTrigger>

              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit Vendor" : "Create Vendor"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <Input
                    placeholder="Primary contact name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />

                  <Input
                    placeholder="Company name"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />

                  <Input
                    placeholder="Contact no."
                    value={form.contactNumber}
                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />

                  <Input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />

                  <Input
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />

                  <Select
                    value={form.sector}
                    onValueChange={(sector) => setForm({ ...form, sector })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-white border-gray-700">
                      <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="SERVICES">Services</SelectItem>
                      <SelectItem value="RETAIL">Retail</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="GST Number"
                    value={form.gstNumber}
                    onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />

                  {error && <p className="text-red-400">{error}</p>}
                  {success && <p className="text-green-400">{success}</p>}

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={submitting}
                    >
                      {submitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update" : "Create")}
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
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedVendors.map((v) => (
                <TableRow key={v.id} className="border-gray-700 hover:bg-gray-700/40">
                  <TableCell className="text-white">{v.id}</TableCell>
                  <TableCell className="text-white">{v.name}</TableCell>
                  <TableCell className="text-white">{v.companyName}</TableCell>
                  <TableCell className="text-white">{v.email}</TableCell>
                  <TableCell className="text-white">{v.contactNumber}</TableCell>
                  <TableCell className="text-white">{v.sector}</TableCell>
                  <TableCell className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600"
                      onClick={() => openEditModal(v)}
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
                  </TableCell>
                </TableRow>
              ))}

              {paginatedVendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                    No vendors found.
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
