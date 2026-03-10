"use client";

import { useState, useEffect } from "react";
import { getProcessedLeaves } from "@/lib/actions/leave";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { format } from "date-fns";
import { Eye, Clock, CheckCircle, XCircle, FileSearch } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LeaveLetterPreview } from "@/components/ui/LeaveLetter";

export default function ProcessedHistory({ user }: { user: any }) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);

  useEffect(() => {
    async function fetchHistory() {
      const res = await getProcessedLeaves();
      if (res.success) setLeaves(res.data);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 text-center text-slate-400">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium">
                  Loading processed history...
                </p>
              </div>
            </div>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <FileSearch className="h-16 w-16 mb-4 opacity-10" />
              <p className="text-lg font-medium">
                No processed applications found.
              </p>
              <p className="text-sm">
                Applications you approve or reject will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Decision Date</TableHead>
                  <TableHead>Your Action</TableHead>
                  <TableHead>Final Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave: any) => {
                  // Find the decision made by THIS official
                  const myHOD =
                    leave.hodApproval?.officialName === user.name
                      ? leave.hodApproval
                      : null;
                  const myDean =
                    leave.deanApproval?.officialName === user.name
                      ? leave.deanApproval
                      : null;
                  const myVC =
                    leave.vcApproval?.officialName === user.name
                      ? leave.vcApproval
                      : null;
                  const myDecision = myHOD || myDean || myVC;

                  return (
                    <TableRow
                      key={leave._id}
                      className="bg-white/50 hover:bg-white transition-colors"
                    >
                      <TableCell>
                        <div className="font-semibold text-slate-900">
                          {leave.applicantName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {leave.applicantDepartment}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="capitalize text-[10px]"
                        >
                          {leave.leaveType?.replace(/_/g, " ") || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {myDecision?.updatedAt
                          ? format(
                              new Date(myDecision.updatedAt),
                              "MMM dd, yyyy",
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {myDecision?.status === "APPROVED" ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                            <CheckCircle className="h-3.5 w-3.5" /> Recommended
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
                            <XCircle className="h-3.5 w-3.5" /> Declined
                          </div>
                        )}
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
                          className="text-[10px] uppercase h-5"
                        >
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => setSelectedLeave(leave)}
                          className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-full text-slate-400 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        className="max-w-5xl"
      >
        {selectedLeave && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
            <div className="bg-white/50 border-b p-3 flex items-center gap-2 justify-center italic text-xs text-slate-400 mb-4 rounded-t-lg">
              <Clock className="h-3 w-3" /> Historical Letter Preview
            </div>
            <LeaveLetterPreview
              user={{ role: "OFFICIAL" }}
              leaveData={selectedLeave}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
