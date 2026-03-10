"use client";

import { useState, useEffect } from "react";
import { getAllLeaves, updateLeaveStatus } from "@/lib/actions/leave";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { format } from "date-fns";
import {
  Check,
  X,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  ListChecks,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { LeaveLetterPreview } from "@/components/ui/LeaveLetter";
import { LeaveForm } from "@/components/forms/LeaveForm";

export default function OfficialDashboardClient({ user }: { user: any }) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    setLoading(true);
    const res = await getAllLeaves();
    if (res.success) {
      setLeaves(res.data);
    }
    setLoading(false);
  }

  const pendingCount = leaves.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-blue-600 border-blue-200 uppercase tracking-widest text-[10px]">
              {user?.officialLevel || "Reviewer"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Official Portal
          </h1>
          <p className="text-slate-500 mt-1">
            Manage administrative leave tasks for{" "}
            {user?.officialLevel === "VC"
              ? "the University"
              : `${user?.officialLevel === "DEAN" ? "Faculty of " : "Dept. of "}${user?.faculty || user?.department}`}
            .
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-linear-to-br from-[#150E56] to-[#7B113A] text-white border-none shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1597BB] opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Pending Approvals
                </p>
                <h3 className="text-4xl font-bold mt-2">{pendingCount}</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl">
                <ListChecks className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/official/approvals"
                className="text-xs font-bold flex items-center gap-1 hover:underline"
              >
                Go to inbox <Eye className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  System Status
                </p>
                <h3 className="text-xl font-bold mt-2 text-emerald-600 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </h3>
              </div>
              <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-6 capitalize">
              Authenticated as {user?.name}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Quick Access
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {user?.role}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {user?.department || "University"}
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Shortened Approvals Preview */}
        <div
          className={
            user?.officialLevel === "VC"
              ? "lg:col-span-12 space-y-6"
              : "lg:col-span-8 space-y-6"
          }
        >
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base">
                Recent Approval Requests
              </CardTitle>
              <Link
                href="/official/approvals"
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell className="text-center py-10 text-slate-400">
                        Loading sync...
                      </TableCell>
                    </TableRow>
                  ) : leaves.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center py-12 text-slate-400">
                        No pending items
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaves.slice(0, 5).map((leave) => (
                      <TableRow
                        key={leave._id}
                        className="hover:bg-slate-50/50"
                      >
                        <TableCell className="py-4">
                          <div className="font-semibold text-slate-900">
                            {leave.applicantName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {leave.applicantIdNumber}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <Link
                            href="/official/approvals"
                            className="inline-flex items-center px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold hover:bg-slate-800"
                          >
                            Process
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Application Quick Link */}
        {user?.officialLevel !== "VC" && (
          <div className="lg:col-span-4">
            <Card className="bg-linear-to-br from-[#8FD6E1]/10 to-[#1597BB]/5 border-[#1597BB]/20 shadow-sm border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-base font-bold text-[#150E56]">
                  My Applications
                </CardTitle>
                <CardDescription className="text-xs text-[#1597BB]">
                  Submit or track your own staff leave requests.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/official/apply"
                  className="w-full flex items-center justify-center py-2.5 px-4 bg-[#7B113A] text-white rounded-xl text-xs font-bold hover:bg-[#7B113A]/90 transition-all shadow-lg shadow-[#7B113A]/20"
                >
                  Apply Now
                </Link>
                <Link
                  href="/official/history"
                  className="w-full flex items-center justify-center py-2.5 px-4 bg-white text-[#150E56] border border-[#150E56]/10 rounded-xl text-xs font-bold hover:bg-[#8FD6E1]/10 transition-all"
                >
                  View My History
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
