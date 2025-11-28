"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  const [productName, setProductName] = useState("");
  const [orderPrice, setOrderPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setProductImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName || !orderPrice || !quantity) {
      alert("Please fill all fields");
      return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", orderPrice);
    formData.append("quantity", quantity);
    if (productImage) formData.append("image", productImage);

    try {
      const res = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Product added successfully!");
        setProductName("");
        setOrderPrice("");
        setQuantity("");
        setProductImage(null);
        setPreview(null);
      } else {
        alert(data.message || "Failed to add product");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="ml-64 p-10 h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Products Management</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-xl shadow-md w-full max-w-xl space-y-4"
      >
        {/* PRODUCT NAME */}
        <div>
          <label className="block mb-1">Product Name</label>
          <Input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="bg-gray-800 text-white border-gray-700"
            placeholder="Enter product name"
          />
        </div>

        {/* ORDER PRICE */}
        <div>
          <label className="block mb-1">Order Price</label>
          <Input
            type="number"
            value={orderPrice}
            onChange={(e) => setOrderPrice(e.target.value)}
            className="bg-gray-800 text-white border-gray-700"
            placeholder="Enter order price"
          />
        </div>

        {/* QUANTITY */}
        <div>
          <label className="block mb-1">Quantity</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="bg-gray-800 text-white border-gray-700"
            placeholder="Enter quantity"
          />
        </div>

        {/* PRODUCT IMAGE */}
        <div>
          <label className="block mb-1">Product Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="bg-gray-800 text-white border-gray-700"
          />
        </div>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded mt-2 border border-gray-700"
          />
        )}

        {/* SUBMIT BUTTON */}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          Add Product
        </Button>
      </form>
    </div>
  );
}
