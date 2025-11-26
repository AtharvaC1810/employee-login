"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      alert("You do not have access to this page");
      router.push("/dashboard");
      return;
    }

    setHasAccess(true);
    setLoading(false);
  }, [router, allowedRoles]);

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (!hasAccess) return null;

  return <>{children}</>;
}
