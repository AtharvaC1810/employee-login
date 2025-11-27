"use client";

import './globals.css';
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const publicPages = ["/login", "/register"];

  const showSidebar = !publicPages.includes(pathname);

  return (
    <div className="flex-1 p-10 ml-0">
      {showSidebar && <Sidebar />}
      <main className={`${showSidebar ? "ml-64" : ""} flex-1`}>{children}</main>
    </div>
  );
}
