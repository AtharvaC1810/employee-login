"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Users", path: "/users" },
    { name: "Vendors", path: "/vendors" },      
    { name: "Products", path: "/products" },     
    { name: "Orders", path: "/orders" },        
    { name: "Roles", path: "/roles" },
    { name: "Permissions", path: "/permissions" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6">
      <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>

      {/* MENU */}
      <nav className="space-y-3">
        {menu.map((m) => (
          <button
            key={m.path}
            onClick={() => router.push(m.path)}
            className={cn(
              "block w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white",
              pathname === m.path && "bg-gray-800 text-white"
            )}
          >
            {m.name}
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="mt-auto">
        <Button
          className="w-full mt-6 bg-red-600 hover:bg-red-700"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
