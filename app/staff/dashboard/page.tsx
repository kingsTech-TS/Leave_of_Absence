import { getCoreUser } from "@/lib/core-user";
import { LeaveForm } from "@/components/forms/LeaveForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getUserLeaves } from "@/lib/actions/leave";
import { Badge } from "@/components/ui/Badge";
import { cookies } from "next/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { format } from "date-fns";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default async function StaffDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const session = token ? await getCoreUser(token) : null;
  if (!session || session.role !== "STAFF") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-bold">Unauthorized</h2>
        <p className="text-slate-500">
          Please log in as a staff member to access this dashboard.
        </p>
        <Link href="/">
          <Badge className="cursor-pointer">Go back</Badge>
        </Link>
      </div>
    );
  }
  const { data: leaves = [] } = await getUserLeaves();

  const stats = [
    {
      label: "Total Left",
      value: leaves.length,
      icon: Clock,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Approved",
      value: leaves.filter((l: any) => l.status === "APPROVED").length,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Pending",
      value: leaves.filter((l: any) => l.status === "PENDING").length,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Staff Portal | {session?.name}
        </h1>
        <p className="text-slate-500">{session?.department} Department</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center p-6 space-x-4">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LeaveForm role="STAFF" initialStaffCategory={session?.staffCategory} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.slice(0, 8).map((leave: any) => (
                  <TableRow key={leave._id}>
                    <TableCell className="font-medium capitalize">
                      {leave.leaveType.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(leave.startDate), "MMM dd")} -{" "}
                      {format(new Date(leave.endDate), "MMM dd")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          leave.status === "APPROVED"
                            ? "success"
                            : leave.status === "REJECTED"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {leave.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-center">
              <Link
                href="/staff/history"
                className="text-sm text-blue-700 font-medium hover:underline"
              >
                View Full Leave History
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
