"use client";

import Link from "next/link";
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
    { name: "Users", path: "/dashboard/users" },
    { name: "Roles", path: "/dashboard/roles" },
    { name: "Permissions", path: "/dashboard/permissions" },
    { name: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6">
      <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>

      <nav className="space-y-3">
        {menu.map((m) => (
          <Link
            key={m.path}
            href={m.path}
            className={cn(
              "block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white",
              pathname === m.path && "bg-gray-800 text-white"
            )}
          >
            {m.name}
          </Link>
        ))}
      </nav>

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
