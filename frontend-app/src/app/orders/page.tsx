"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

// -----------------------------
// INTERFACES
// -----------------------------
interface Product {
  id: number;
  name: string;
  price: number;
  image?: string | null;
}

interface Order {
  id: number;
  product: Product;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

// -----------------------------
// MAIN COMPONENT
// -----------------------------
export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "ENGINEER", "INTERN"]}>
      <OrdersContent />
    </ProtectedRoute>
  );
}

function OrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------------
  // FETCH ORDERS
  // ---------------------------------
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------
  // INITIAL LOAD
  // ---------------------------------
  useEffect(() => {
    fetchOrders();
  }, []);

  // ---------------------------------
  // RENDER
  // ---------------------------------
  if (loading)
    return <p className="text-center mt-10 text-white">Loading orders...</p>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-8 pl-64">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>

        <div className="rounded-lg bg-gray-800 p-4 mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} className="border-gray-700">
                  <TableCell>{o.id}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {o.product.image && (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${o.product.image}`}
                        alt={o.product.name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    )}
                    {o.product.name}
                  </TableCell>
                  <TableCell>{o.quantity}</TableCell>
                  <TableCell>₹{o.totalPrice}</TableCell>
                  <TableCell>
                    {new Date(o.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-4">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
