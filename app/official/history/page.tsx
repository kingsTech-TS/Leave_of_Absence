import { getCoreUser } from "@/lib/core-user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OfficialHistoryContent from "@/components/ui/OfficialHistoryContent";

export default async function OfficialHistoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? await getCoreUser(token) : null;

  if (!user || user.role !== "OFFICIAL") {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <OfficialHistoryContent user={user} />
    </div>
  );
}
