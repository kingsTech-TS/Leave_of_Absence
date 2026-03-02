import { getSession } from "@/lib/auth";
import LeaveHistoryClient from "@/components/ui/LeaveHistory";

export default async function HistoryPage() {
  const session = await getSession();

  return <LeaveHistoryClient user={session} />;
}
