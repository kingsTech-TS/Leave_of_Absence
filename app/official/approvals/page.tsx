import OfficialApprovals from "@/components/ui/OfficialApprovals";
import { getCoreUser } from "@/lib/core-user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function OfficialApprovalsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const session = token ? await getCoreUser(token) : null;

  if (!session || session.role !== "OFFICIAL") {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto">
      <OfficialApprovals user={session} />
    </div>
  );
}
