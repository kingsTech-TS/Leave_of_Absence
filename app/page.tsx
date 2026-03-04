import { getCoreUser } from "@/lib/core-user";
import { redirect } from "next/navigation";

export default async function RootPage() {
  console.log("[RootPage] Checking core session...");
  const user = await getCoreUser();

  if (user) {
    console.log(
      `[RootPage] User authenticated as ${user.role}. Redirecting to dashboard...`,
    );
    const rolePath = user.role.toLowerCase();
    if (user.role === "OFFICIAL") {
      return redirect("/official");
    }
    return redirect(`/${rolePath}/dashboard`);
  }

  console.log("[RootPage] No user session. Redirecting to Core login...");
  const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";
  redirect(`${CORE_URL}/login?module=leave_of_absence`);
}
