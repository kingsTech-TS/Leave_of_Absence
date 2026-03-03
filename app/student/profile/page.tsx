import { getSession } from "@/lib/auth";
import Profile from "@/components/ui/Profile";

export default async function StudentProfilePage() {
  const session = await getSession();

  return <Profile user={session} />;
}
