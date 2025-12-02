"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

// UI Imports
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
  image?: string | null;
  vendorName: string;
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

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [orderError, setOrderError] = useState("");


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

  // ---------------------------------
  // INITIAL LOAD
  // ---------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    setCurrentUser(JSON.parse(user));

    // Load vendors first → avoids vendorName mismatch
    fetchVendors(token).then(() => fetchProducts(token));
  }, []);

  // ---------------------------------
  // FETCH VENDORS
  // ---------------------------------
  const fetchVendors = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch vendors");

      const data: Vendor[] = await res.json();
      setVendors(data);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------------------------
  // FETCH PRODUCTS
  // ---------------------------------
  const fetchProducts = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch products");

      const data: Product[] = await res.json();

      // Map vendor names
      const vendorMap: Record<number, string> = {};
      vendors.forEach((v) => {
        vendorMap[v.id] = v.companyName || v.name;
      });

      const updatedProducts: Product[] = data.map((p: any) => ({
        ...p,
        vendorName: vendorMap[p.vendorId] || "Unknown",
        image: p.image || null,
      }));

      const sorted = sortProducts(updatedProducts);

      setProducts(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------
  // SORT FUNCTION
  // ---------------------------------
  const sortProducts = (list: Product[]) => {
    const sorted = [...list];
    switch (sortOption) {
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

  // ---------------------------------
  // SEARCH + SORT
  // ---------------------------------
  useEffect(() => {
    let updated = [...products];

    if (search.trim()) {
      updated = updated.filter((p) =>
        `${p.name} ${p.price} ${p.vendorName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    updated = sortProducts(updated);
    setFiltered(updated);
    setCurrentPage(1);
  }, [search, sortOption, products]);

  // ---------------------------------
  // PAGINATION
  // ---------------------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ---------------------------------
  // CREATE PRODUCT
  // ---------------------------------
  const handleCreateProduct = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!form.name || !form.price || !form.vendorId || !form.image)
        throw new Error("All fields required");

      const token = localStorage.getItem("token");

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("vendorId", form.vendorId);
      if (form.image) fd.append("image", form.image);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to create product");

      setSuccess("Product created");
      setForm({ name: "", price: "", vendorId: "", image: null });

      await fetchVendors(token!);
      await fetchProducts(token!);

      setTimeout(() => setModalOpen(false), 800);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ---------------------------------
  // CREATE VENDOR
  // ---------------------------------
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

      await fetchVendors(token!);

      setTimeout(() => setVendorModalOpen(false), 800);
    } catch (err: any) {
      setVendorError(err.message);
    }
  };

  // ---------------------------------
  // DELETE PRODUCT
  // ---------------------------------
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  // ---------------------------------
  // RENDER
  // ---------------------------------
  if (loading)
    return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-8 pl-64">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products Management</h1>

          {currentUser?.role === "ADMIN" && (
            <>
              {/* ADD PRODUCT MODAL */}
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    + Add Product
                  </Button>
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
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />

                    <Input
                      placeholder="Price"
                      type="number"
                      className="bg-gray-800 border-gray-700"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                    />

                    <Input
                      type="file"
                      accept="image/*"
                      className="bg-gray-800 border-gray-700"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          image: e.target.files?.[0] || null,
                        })
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

                      <SelectContent className="bg-gray-800 border-gray-700">
                        {vendors.map((v) => (
                          <SelectItem
                            key={v.id}
                            value={v.id.toString()}
                          >
                            {v.companyName || v.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">+ Add Vendor</SelectItem>
                      </SelectContent>
                    </Select>

                    {error && <p className="text-red-400">{error}</p>}
                    {success && (
                      <p className="text-green-400">{success}</p>
                    )}

                    <DialogFooter>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Create
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* ADD VENDOR MODAL */}
              <Dialog
                open={vendorModalOpen}
                onOpenChange={setVendorModalOpen}
              >
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Add Vendor</DialogTitle>
                  </DialogHeader>

                  <form
                    onSubmit={handleCreateVendor}
                    className="space-y-4"
                  >
                    <Input
                      placeholder="Contact Person Name"
                      className="bg-gray-800 border-gray-700"
                      value={vendorForm.name}
                      onChange={(e) =>
                        setVendorForm({
                          ...vendorForm,
                          name: e.target.value,
                        })
                      }
                    />

                    <Input
                      placeholder="Company Name"
                      className="bg-gray-800 border-gray-700"
                      value={vendorForm.companyName}
                      onChange={(e) =>
                        setVendorForm({
                          ...vendorForm,
                          companyName: e.target.value,
                        })
                      }
                    />

                    {vendorError && (
                      <p className="text-red-400">{vendorError}</p>
                    )}
                    {vendorSuccess && (
                      <p className="text-green-400">
                        {vendorSuccess}
                      </p>
                    )}

                    <DialogFooter>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Create Vendor
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* ORDER PRODUCT MODAL */}
<Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
  <DialogContent className="bg-gray-900 border-gray-700">
    <DialogHeader>
      <DialogTitle>
        Order Product
      </DialogTitle>
    </DialogHeader>

    {orderProduct && (
      <div className="space-y-4">

        <p className="text-lg font-semibold">
          {orderProduct.name}
        </p>

        <Input
          type="number"
          placeholder="Enter quantity"
          className="bg-gray-800 border-gray-700"
          value={orderQuantity}
          onChange={(e) => setOrderQuantity(e.target.value)}
        />

        {orderError && (
          <p className="text-red-400">{orderError}</p>
        )}
        {orderSuccess && (
          <p className="text-green-400">{orderSuccess}</p>
        )}

        <DialogFooter>

        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={async () => {
            setOrderError("");
            setOrderSuccess("");

            if (!orderQuantity || Number(orderQuantity) <= 0) {
              setOrderError("Enter a valid quantity");
              return;
            }

        const token = localStorage.getItem("token");

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/orders`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                productId: orderProduct!.id,
                quantity: Number(orderQuantity),
              }),
            }
          );

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Failed to place order");
          }

          setOrderSuccess("Order placed successfully!");

          setTimeout(() => setOrderModalOpen(false), 900);

        } catch (err: any) {
          setOrderError(err.message);
        }
      }}
    >
      Place Order
    </Button>
        </DialogFooter>
      </div>
    )}
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

                  <TableCell className="text-center flex gap-2 justify-center">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setOrderProduct(p);
                          setOrderQuantity("");
                          setOrderError("");
                          setOrderSuccess("");
                          setOrderModalOpen(true);
                        }}
                      >
                        Order
                      </Button>

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
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-400 py-4"
                  >
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
