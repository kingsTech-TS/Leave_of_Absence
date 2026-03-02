import { Sidebar, Navbar } from "@/components/layout/DashboardLayout";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "STAFF") {
    redirect("/login");
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
