"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  User as UserIcon,
  Users as UsersIcon,
  ShieldCheck as RoleIcon,
  Lock as PermissionIcon,
  LogOut as LogoutIcon,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8">
          Hello {username}
        </h1>

        <p className="text-gray-300 mb-10 text-lg">
          Welcome to your dashboard. Select an option below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-gray-200">{card.desc}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
