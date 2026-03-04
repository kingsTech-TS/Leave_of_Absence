import { getCoreUser } from "@/lib/core-user";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const user = await getCoreUser();

  if (user) {
    const rolePath = user.role.toLowerCase();
    if (user.role === "OFFICIAL") {
      return redirect("/official");
    }
    return redirect(`/${rolePath}/dashboard`);
  }

  const CORE_URL =
    process.env.NEXT_PUBLIC_CORE_URL || "https://eksucore.vercel.app";
  redirect(`${CORE_URL}/login?module=leave_of_absence`);
}
