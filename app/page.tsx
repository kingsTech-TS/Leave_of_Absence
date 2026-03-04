import { getCoreUser } from "@/lib/core-user";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const cookieHeader = headersList.get("cookie") || "absent";

  console.log(
    `[RootPage] Init | Host: ${host} | Proto: ${proto} | Cookie Header: ${cookieHeader !== "absent" ? "present" : "missing"}`,
  );

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  console.log(
    `[RootPage] Token cookie state: ${token ? "Found (" + token.substring(0, 5) + "...)" : "Not Found"}`,
  );

  const user = token ? await getCoreUser(token) : null;

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
  const currentUrl = `${proto}://${host}/`;

  redirect(
    `${CORE_URL}/login?module=leave_of_absence&redirect=${encodeURIComponent(currentUrl)}`,
  );
}
