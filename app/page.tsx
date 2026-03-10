import { getCoreUser } from "@/lib/core-user";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // If token exists, validate it and route to the right dashboard
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

  // No valid session → go to local login page
  redirect("/login");
}
