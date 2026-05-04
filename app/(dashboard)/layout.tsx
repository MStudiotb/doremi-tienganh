import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen overflow-hidden">
      <Sidebar />
      {/* Mobile: no margin-left, Desktop: ml-64 for sidebar */}
      {/* Mobile: pb-20 for bottom nav, Desktop: pb-0 */}
      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto bg-gradient-to-br from-midnight-purple via-[#261866] to-[#063a75] pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
