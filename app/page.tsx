import { redirect } from "next/navigation";

export default function RootPage() {
  const CORE_URL = "https://eksucore.vercel.app";
  redirect(`${CORE_URL}/login?module=leave_of_absence`);
}
