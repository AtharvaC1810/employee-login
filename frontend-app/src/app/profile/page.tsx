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
