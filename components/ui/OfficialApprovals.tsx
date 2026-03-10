"use client";

import { useState, useEffect } from "react";
import { getAllLeaves, updateLeaveStatus } from "@/lib/actions/leave";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
import { Check, X, Search, Eye, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { LeaveLetterPreview } from "@/components/ui/LeaveLetter";

export default function OfficialApprovals({ user }: { user: any }) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedLeave, setSelectedLeave] = useState<any>(null);

  const [comments, setComments] = useState<Record<string, string>>({});

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

  const handleStatusUpdate = async (
    id: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    const comment = comments[id] || "";
    const res = await updateLeaveStatus(id, status, comment);
    if (res.success) {
      const newComments = { ...comments };
      delete newComments[id];
      setComments(newComments);
      setSelectedLeave(null);
      fetchLeaves();
    }
  };

  const filteredLeaves = leaves.filter(
    (l) =>
      l.applicantName?.toLowerCase().includes(filter.toLowerCase()) ||
      l.leaveType?.toLowerCase().includes(filter.toLowerCase()) ||
      l.applicantIdNumber?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Pending Approvals
          </h1>
          <p className="text-slate-500">
            Review and manage collective leave applications for your
            jurisdiction.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search applicants..."
            className="pl-10"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Decision Inbox</CardTitle>
          <Badge variant="default" className="bg-blue-100 text-blue-700">
            {filteredLeaves.length} PENDING
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Department / Faculty</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                      Loading applications...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="text-slate-300">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium text-slate-400">
                        Your inbox is clear
                      </p>
                      <p className="text-xs">
                        No pending leave requests found.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeaves.map((leave: any) => (
                  <TableRow
                    key={leave._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        {leave.applicantName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ID: {leave.applicantIdNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-700">
                        {leave.applicantDepartment || "N/A"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {leave.applicantFaculty || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="capitalize text-[10px] font-normal">
                        {leave.leaveType?.replace(/_/g, " ") || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600">
                        {format(new Date(leave.startDate), "MMM dd")} -{" "}
                        {format(new Date(leave.endDate), "dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="warning"
                        className="text-[9px] uppercase tracking-wider"
                      >
                        {leave.currentStage?.replace(/_/g, " ") || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          Review Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        className="max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        {selectedLeave && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 p-4">
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-4">
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                  Your Recommendation
                </h3>

                <div className="space-y-6">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-800 font-medium mb-1">
                      Applicant Role
                    </p>
                    <p className="text-sm text-blue-900 font-bold capitalize">
                      {selectedLeave.userId?.role?.toLowerCase() || "Student"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="official-comment">
                        Review Remarks / Comments
                      </Label>
                      <Textarea
                        id="official-comment"
                        placeholder="Enter your observations or reason for recommendation/approval..."
                        className="min-h-[120px] text-sm"
                        value={comments[selectedLeave._id] || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setComments({
                            ...comments,
                            [selectedLeave._id]: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          handleStatusUpdate(selectedLeave._id, "REJECTED")
                        }
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 shadow-md"
                        onClick={() =>
                          handleStatusUpdate(selectedLeave._id, "APPROVED")
                        }
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Recommend
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t mt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Stage History
                    </h4>
                    <div className="space-y-4">
                      {["HOD", "DEAN", "VC"].map((stage, idx) => {
                        const approval =
                          selectedLeave[`${stage.toLowerCase()}Approval`];
                        const isCurrent =
                          (stage === "HOD" &&
                            selectedLeave.currentStage === "HOD_APPROVAL") ||
                          (stage === "DEAN" &&
                            selectedLeave.currentStage === "DEAN_APPROVAL") ||
                          (stage === "VC" &&
                            selectedLeave.currentStage === "VC_APPROVAL");

                        const isBypassed = approval?.status === "N/A";
                        const isApproved = approval?.status === "APPROVED";

                        return (
                          <div
                            key={stage}
                            className={`flex items-start gap-3 ${!approval?.status && !isCurrent ? "opacity-30" : ""}`}
                          >
                            <div
                              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold 
                                ${
                                  isApproved
                                    ? "bg-green-500 border-green-500 text-white"
                                    : isBypassed
                                      ? "bg-slate-100 border-slate-200 text-slate-400"
                                      : isCurrent
                                        ? "bg-indigo-50 border-indigo-500 text-indigo-600 animate-pulse"
                                        : "bg-white border-slate-300 text-slate-300"
                                }`}
                            >
                              {isApproved ? (
                                <Check className="h-3 w-3" />
                              ) : isBypassed ? (
                                "-"
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-0.5">
                                <span
                                  className={`text-xs font-bold ${isCurrent ? "text-indigo-600" : isBypassed ? "text-slate-400" : "text-slate-700"}`}
                                >
                                  {stage} Review {isBypassed && "(N/A)"}
                                </span>
                                {approval?.status && !isBypassed && (
                                  <Badge
                                    variant={
                                      approval.status === "APPROVED"
                                        ? "success"
                                        : "danger"
                                    }
                                    className="text-[8px] h-3.5 px-1 uppercase"
                                  >
                                    {approval.status}
                                  </Badge>
                                )}
                                {isBypassed && (
                                  <span className="text-[10px] text-slate-400 italic">
                                    Bypassed
                                  </span>
                                )}
                              </div>
                              {approval?.comment && (
                                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded mt-1 border border-slate-100">
                                  "{approval.comment}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-8">
              <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <div className="bg-white/50 border-b p-3 flex items-center gap-2 justify-center italic text-xs text-slate-400">
                  <Clock className="h-3 w-3" /> Visual preview of the formal
                  application letter
                </div>
                <LeaveLetterPreview
                  user={
                    selectedLeave.userId || {
                      name: selectedLeave.applicantName,
                      idNumber: selectedLeave.applicantIdNumber,
                      department: selectedLeave.applicantDepartment,
                      faculty: selectedLeave.applicantFaculty,
                    }
                  }
                  leaveData={selectedLeave}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
