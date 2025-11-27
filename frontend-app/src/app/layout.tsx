import './globals.css';
import 'side'
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: 'My App',
  description: 'Next.js + Tailwind App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Sidebar />
      <body>{children}</body>
    </html>
  );
}
