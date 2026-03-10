import { LeaveForm } from "@/components/forms/LeaveForm";
import { getCoreUser } from "@/lib/core-user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";

export default async function OfficialApplyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const session = token ? await getCoreUser(token) : null;

  if (!session || session.role !== "OFFICIAL") {
    redirect("/");
  }

  // VC does not need to apply
  if (session.officialLevel === "VC") {
    redirect("/official");
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Staff Leave Application
        </h1>
        <p className="text-slate-500 mt-2">
          As an official ({session.officialLevel}), your application will be
          routed to the appropriate supervisor for approval.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <LeaveForm
          role="OFFICIAL"
          initialStaffCategory={session.staffCategory}
        />

        <Card className="bg-blue-50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 text-base">
              Approval Routing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <p>
              {session.officialLevel === "HOD"
                ? "Your request will be sent to the Dean of your faculty, and then to the Vice Chancellor for final approval."
                : "Your request will be sent directly to the Vice Chancellor for approval."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
