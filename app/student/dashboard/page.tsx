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
import { FileText, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const session = token ? await getCoreUser(token) : null;
  if (!session || session.role !== "STUDENT") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-bold">Unauthorized</h2>
        <p className="text-slate-500">
          Please log in as a student to access this dashboard.
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
      label: "Total Requests",
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
    {
      label: "Rejected",
      value: leaves.filter((l: any) => l.status === "REJECTED").length,
      icon: XCircle,
      color: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {session?.name}
          </h1>
          <p className="text-slate-500">
            Apply for a new leave or track your existing requests.
          </p>
        </div>
        <Link href="/student/history">
          <Badge
            variant="default"
            className="cursor-pointer hover:bg-slate-200 py-1 px-3"
          >
            View History →
          </Badge>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center p-6 justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <LeaveForm role="STUDENT" />
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Recent Applications</CardTitle>
              <Link
                href="/student/history"
                className="text-sm font-medium text-blue-700 hover:underline"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {leaves.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <FileText className="h-12 w-12 mb-4 opacity-20" />
                  <p>No leave applications found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.slice(0, 5).map((leave: any) => (
                      <TableRow key={leave._id}>
                        <TableCell className="font-medium capitalize">
                          {leave.leaveType.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(leave.startDate), "MMM dd, yyyy")}
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
                        <TableCell className="text-right">
                          <Link href={`/student/history`}>
                            <Badge className="cursor-pointer hover:bg-slate-200">
                              Preview
                            </Badge>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
