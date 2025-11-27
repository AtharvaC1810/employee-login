"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  Shield,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr || !token) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(userStr);
    setUser(parsed);
    setRole(parsed.role?.toUpperCase());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!user)
    return (
      <div className="text-white text-center mt-10">Loading profile...</div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-64 bg-white shadow-lg border-r hidden md:flex flex-col p-5">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <LayoutDashboard size={26} /> Dashboard
        </h2>

        <nav className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronRight className="mr-2 h-4 w-4" /> Dashboard Home
          </Button>

          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => router.push("/profile")}
          >
            <User className="mr-2 h-4 w-4" /> Profile
          </Button>

          {role === "ADMIN" && (
            <>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => router.push("/users")}
              >
                <Users className="mr-2 h-4 w-4" /> User Management
              </Button>

              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => router.push("/roles")}
              >
                <Shield className="mr-2 h-4 w-4" /> Role Management
              </Button>

              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => router.push("/permissions")}
              >
                <Lock className="mr-2 h-4 w-4" /> Permissions
              </Button>
            </>
          )}

          <Button
            variant="destructive"
            className="justify-start mt-4"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </nav>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 p-6 flex justify-center items-center">
        <Card className="w-full max-w-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Your Profile
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-gray-700">
            <div className="space-y-3 text-lg">
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                <span className="uppercase font-semibold">{user.role}</span>
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push("/edit-profile")}
              >
                Edit Profile
              </Button>

              <Button className="w-full" variant="outline" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>

              <Button
                className="w-full"
                variant="destructive"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
