import { getCoreUser } from "@/lib/core-user";
import Profile from "@/components/ui/Profile";

export default async function StaffProfilePage() {
  const session = await getCoreUser();

  return <Profile user={session} />;
}
