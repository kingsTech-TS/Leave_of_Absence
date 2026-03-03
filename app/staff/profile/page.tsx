import { getSession } from "@/lib/auth";
import Profile from "@/components/ui/Profile";

export default async function StaffProfilePage() {
  const session = await getSession();

  return <Profile user={session} />;
}
