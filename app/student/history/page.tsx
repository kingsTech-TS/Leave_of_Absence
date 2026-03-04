import { getCoreUser } from "@/lib/core-user";
import LeaveHistoryClient from "@/components/ui/LeaveHistory";

export default async function HistoryPage() {
  const session = await getCoreUser();

  return <LeaveHistoryClient user={session} />;
}
