"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

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
      console.log("Invalid token:", error);
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
      desc: "Sign out of your account",
      icon: <LogoutIcon size={32} />,
      action: logout,
      visible: true,
      bg: "bg-gray-700",
    },
  ];

  // -----------------------------
  // SIDEBAR LINKS
  // -----------------------------
  const sidebarLinks = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
      visible: true,
    },
    {
      label: "Profile",
      icon: <UserIcon size={20} />,
      path: "/profile",
      visible: true,
    },
    {
      label: "Users",
      icon: <UsersIcon size={20} />,
      path: "/users",
      visible: role === "ADMIN",
    },
    {
      label: "Roles",
      icon: <RoleIcon size={20} />,
      path: "/roles",
      visible: role === "ADMIN",
    },
    {
      label: "Permissions",
      icon: <PermissionIcon size={20} />,
      path: "/permissions",
      visible: role === "ADMIN",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ---------------------------------------------------------------- */}
      {/* SIDEBAR */}
      {/* ---------------------------------------------------------------- */}
      <aside className="w-64 bg-white border-r shadow-md p-6 fixed h-full">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

        <nav className="flex flex-col gap-4">
          {sidebarLinks
            .filter((l) => l.visible)
            .map((item, idx) => (
              <button
                key={idx}
                onClick={() => router.push(item.path)}
                className="flex items-center gap-3 px-4 py-2 text-left rounded-lg hover:bg-gray-200 transition"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 text-left rounded-lg hover:bg-red-200 text-red-600 mt-6"
          >
            <LogoutIcon size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* MAIN CONTENT */}
      {/* ---------------------------------------------------------------- */}
      <main className="flex-1 ml-64 p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Hello {username}
        </h1>
        <p className="text-gray-600 mb-10 text-lg">
          Welcome to your dashboard. Select an option below.
        </p>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards
            .filter((card) => card.visible)
            .map((card, idx) => (
              <div
                key={idx}
                onClick={card.action}
                className={`${card.bg} cursor-pointer rounded-2xl shadow-lg p-6 flex flex-col items-start gap-4 text-white hover:scale-105 transition-transform`}
              >
                <div>{card.icon}</div>
                <h2 className="text-xl font-bold">{card.title}</h2>
                <p className="opacity-90">{card.desc}</p>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
