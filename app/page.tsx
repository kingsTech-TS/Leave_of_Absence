import { getCoreUser } from "@/lib/core-user";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const headersList = await headers();

  const host = headersList.get("host") || "localhost:3000";
  // Derive scheme consistently with the auth callback: check host, not x-forwarded-proto
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  const proto = isLocalhost ? "http" : "https";

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  console.log(
    `[RootPage] Host: ${host} | Protocol: ${proto} | Token: ${
      token ? "Present" : "Missing"
    }`,
  );

  // If token exists, validate it with Core
  if (token) {
    const user = await getCoreUser(token);

    if (user) {
      console.log(`[RootPage] Authenticated user: ${user.name} (${user.role})`);

      if (user.role === "OFFICIAL") {
        redirect("/official");
      }

      redirect(`/${user.role.toLowerCase()}/dashboard`);
    }
  }

  // No valid session → redirect to Core login
  console.log("[RootPage] No valid session. Redirecting to Core login...");

  const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";

  const currentUrl = `${proto}://${host}`;

  redirect(
    `${CORE_URL}/login?module=leave_of_absence&redirect=${encodeURIComponent(
      currentUrl,
    )}`,
  );
}
