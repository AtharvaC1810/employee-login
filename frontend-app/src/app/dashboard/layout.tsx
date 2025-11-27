import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="w-full p-6 bg-gray-900 min-h-screen text-white">
        {children}
      </main>
    </div>
  );
}
