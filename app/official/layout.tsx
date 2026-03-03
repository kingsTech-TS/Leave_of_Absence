import { getSession } from "@/lib/auth";
import { Sidebar, Navbar } from "@/components/layout/DashboardLayout";
import { redirect } from "next/navigation";

export default async function OfficialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "OFFICIAL") {
    const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";
    redirect(`${CORE_URL}/login?module=leave_of_absence`);
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="OFFICIAL" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={session} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
