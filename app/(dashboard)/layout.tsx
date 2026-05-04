import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen overflow-hidden">
      <Sidebar />
      <main className="ml-64 h-screen overflow-y-auto bg-gradient-to-br from-midnight-purple via-[#261866] to-[#063a75]">
        {children}
      </main>
    </div>
  );
}
