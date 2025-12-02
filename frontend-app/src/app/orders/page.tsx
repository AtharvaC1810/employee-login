"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BACKEND_URL = "https://employee-login-fs5m.onrender.com";

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(`${BACKEND_URL}/orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-xl font-semibold">
        Loading orders...
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 text-xl">{error}</div>
    );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📦 Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3">Order ID</th>
                <th className="border p-3">Product</th>
                <th className="border p-3">Product Image</th>
                <th className="border p-3">Quantity</th>
                <th className="border p-3">Price</th>
                <th className="border p-3">Vendor</th>
                <th className="border p-3">Created At</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="text-center">
                  <td className="border p-3">{order.id}</td>

                  <td className="border p-3 font-semibold">
                    {order.product?.name || "N/A"}
                  </td>

                  <td className="border p-3">
                    {order.product?.image ? (
                      <Image
                        src={`${BACKEND_URL}/uploads/products/${order.product.image}`}
                        alt="Product Image"
                        width={70}
                        height={70}
                        className="rounded-md mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No Image
                      </span>
                    )}
                  </td>

                  <td className="border p-3">{order.quantity}</td>

                  <td className="border p-3">₹{order.price}</td>

                  <td className="border p-3">{order.vendor?.name || "N/A"}</td>

                  <td className="border p-3">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
