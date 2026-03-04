import { Sidebar, Navbar } from "@/components/layout/DashboardLayout";
import { getCoreUser } from "@/lib/core-user";
import { redirect } from "next/navigation";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCoreUser();

  if (!session || session.role !== "STAFF") {
    const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";
    redirect(`${CORE_URL}/login?module=leave_of_absence`);
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="STAFF" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={session} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
