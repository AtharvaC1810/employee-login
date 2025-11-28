"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Store as StoreIcon, Package2 as ProductIcon } from "lucide-react";

import {
  User as UserIcon,
  Users as UsersIcon,
  ShieldCheck as RoleIcon,
  Lock as PermissionIcon,
  LayoutDashboard,
  LogOut as LogoutIcon,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  // -----------------------------
  // AUTH CHECK
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      setUsername(decoded.email || "User");

      const user = JSON.parse(userData);
      setRole((user.role || "").toUpperCase());
    } catch (error) {
      router.push("/login");
    }
  }, []);

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // -----------------------------
  // DASHBOARD CARDS
  // -----------------------------
  const cards = [
    {
      title: "Profile",
      desc: "View and edit your profile",
      icon: <UserIcon size={32} />,
      action: () => router.push("/profile"),
      visible: true,
      bg: "bg-gradient-to-r from-green-500 via-green-600 to-green-700",
    },
    {
      title: "User Management",
      desc: "View, create, edit, and delete users",
      icon: <UsersIcon size={32} />,
      action: () => router.push("/users"),
      visible: role === "ADMIN",
      bg: "bg-gradient-to-r from-purple-600 via-pink-500 to-red-500",
    },
    {
      title: "Vendor Management",
      desc: "Manage vendor records and company details",
      icon: <StoreIcon size={32} />,
      action: () => router.push("/vendors"),
      visible: role === "ADMIN",
      bg: "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800",
    },

    // ⭐ NEW — PRODUCTS PAGE CARD
    {
      title: "Products Management",
      desc: "Manage products, price, stock, and images",
      icon: <ProductIcon size={32} />,
      action: () => router.push("/products"),
      visible: role === "ADMIN",
      bg: "bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500",
    },

    {
      title: "Role Management",
      desc: "Assign and manage user roles",
      icon: <RoleIcon size={32} />,
      action: () => router.push("/roles"),
      visible: role === "ADMIN",
      bg: "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500",
    },
    {
      title: "Permissions Management",
      desc: "Manage permissions for roles",
      icon: <PermissionIcon size={32} />,
      action: () => router.push("/permissions"),
      visible: role === "ADMIN",
      bg: "bg-gradient-to-r from-pink-500 via-pink-600 to-red-600",
    },
    {
      title: "Logout",
      desc: "Sign out",
      icon: <LogoutIcon size={32} />,
      action: logout,
      visible: true,
      bg: "bg-gray-700",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Hello {username}
        </h1>
        <p className="text-gray-600 mb-10 text-lg">
          Welcome to your dashboard. Select an option below.
        </p>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards
            .filter((card) => card.visible)
            .map((card, idx) => (
              <div
                key={idx}
                onClick={card.action}
                className={`${card.bg} cursor-pointer rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 text-white hover:scale-105 transition-transform`}
              >
                {card.icon}
                <h2 className="text-xl font-bold">{card.title}</h2>
                <p className="opacity-90">{card.desc}</p>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
