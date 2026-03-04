import OfficialDashboardClient from "@/components/ui/OfficialDashboard";
import { getCoreUser } from "@/lib/core-user";
import { Badge } from "@/components/ui/Badge";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function OfficialPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const session = token ? await getCoreUser(token) : null;
  if (!session || session.role !== "OFFICIAL") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-bold">Unauthorized</h2>
        <p className="text-slate-500">
          Please log in as an Official to access this dashboard.
        </p>
        <Link href="/">
          <Badge className="cursor-pointer">Go back</Badge>
        </Link>
      </div>
    );
  }
  return <OfficialDashboardClient />;
}
