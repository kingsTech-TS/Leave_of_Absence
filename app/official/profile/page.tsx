import { getSession } from "@/lib/auth";
import Profile from "@/components/ui/Profile";

export default async function OfficialProfilePage() {
  const session = await getSession();

  return <Profile user={session} />;
}
