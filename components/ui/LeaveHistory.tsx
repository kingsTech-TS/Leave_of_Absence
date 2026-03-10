"use client";

import { useState, useEffect } from "react";
import { getUserLeaves } from "@/lib/actions/leave";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
import { FileText, Eye, Download, Clock, CheckCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LeaveLetterPreview } from "@/components/ui/LeaveLetter";

export default function LeaveHistory({
  user,
  hideHeader = false,
}: {
  user: any;
  hideHeader?: boolean;
}) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);

  useEffect(() => {
    async function fetchLeaves() {
      const res = await getUserLeaves();
      if (res.success) setLeaves(res.data);
      setLoading(false);
    }
    fetchLeaves();
  }, []);

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Leave History</h1>
        </div>
      )}

      {/* Active Application Tracking - Immediate Progress View */}
      {leaves.length > 0 && (
        <Card
          className={`border shadow-lg overflow-hidden ${leaves[0].status === "PENDING" ? "border-blue-100 bg-blue-50/10" : leaves[0].status === "APPROVED" ? "border-green-100 bg-green-50/10" : "border-red-100 bg-red-50/10"}`}
        >
          <CardHeader
            className={`${leaves[0].status === "PENDING" ? "bg-blue-50/30 border-blue-100/50" : leaves[0].status === "APPROVED" ? "bg-green-50/30 border-green-100/50" : "bg-red-50/30 border-red-100/50"} border-b py-3`}
          >
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {leaves[0].status === "PENDING"
                ? "Active Application Tracking"
                : "Latest Application Status"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {leaves.slice(0, 1).map((active) => (
              <div key={active._id}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <Badge className="mb-1 text-blue-700 border-blue-200">
                      {active.leaveType?.replace(/_/g, " ") || "LEAVE"}
                    </Badge>
                    <p className="text-xs text-slate-500">
                      Applied on {format(new Date(active.createdAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">
                        Current Location:
                      </span>
                      <Badge
                        variant={
                          active.status === "REJECTED"
                            ? "danger"
                            : active.status === "APPROVED"
                              ? "success"
                              : "warning"
                        }
                        className="font-bold border shadow-sm"
                      >
                        {active.currentStage === "COMPLETED"
                          ? "VC (APPROVED)"
                          : active.currentStage?.replace(/_/g, " ") ||
                            "PENDING"}
                      </Badge>
                    </div>
                    {active.status === "PENDING" && (
                      <p className="text-[10px] text-blue-600 font-medium animate-pulse">
                        Waiting for {active.currentStage?.split("_")[0]}{" "}
                        review...
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* HOD Tracking */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      active.hodApproval?.status === "APPROVED"
                        ? "bg-green-50/50 border-green-200"
                        : active.currentStage === "HOD_APPROVAL"
                          ? "bg-white border-blue-400 ring-2 ring-blue-100"
                          : active.hodApproval?.status === "REJECTED"
                            ? "bg-red-50/50 border-red-200"
                            : "bg-white/50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${active.currentStage === "HOD_APPROVAL" ? "text-blue-600" : "text-slate-400"}`}
                      >
                        Step 1: HOD
                      </span>
                      <Badge
                        variant={
                          active.hodApproval?.status === "APPROVED"
                            ? "success"
                            : active.hodApproval?.status === "REJECTED"
                              ? "danger"
                              : active.currentStage === "HOD_APPROVAL"
                                ? "warning"
                                : "default"
                        }
                        className="text-[9px] px-1.5 h-4"
                      >
                        {active.hodApproval?.status || "PENDING"}
                      </Badge>
                    </div>
                    {active.hodApproval?.status === "APPROVED" ? (
                      <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100 italic line-clamp-2">
                        {active.hodApproval.comment
                          ? `"${active.hodApproval.comment}"`
                          : "Approved by HOD"}
                      </p>
                    ) : active.hodApproval?.status === "REJECTED" ? (
                      <p className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100 italic">
                        {active.hodApproval.comment
                          ? `"${active.hodApproval.comment}"`
                          : "Rejected by HOD"}
                      </p>
                    ) : active.hodApproval?.status === "N/A" ? (
                      <p className="text-[10px] italic text-slate-400">
                        Stage bypassed (Official Application)
                      </p>
                    ) : (
                      <p
                        className={`text-[10px] italic ${active.currentStage === "HOD_APPROVAL" ? "text-blue-500 font-medium" : "text-slate-400 opacity-50"}`}
                      >
                        {active.currentStage === "HOD_APPROVAL"
                          ? "Awaiting HOD's recommendation..."
                          : "Pending Step 1"}
                      </p>
                    )}
                  </div>

                  {/* Dean Tracking */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      active.deanApproval?.status === "APPROVED"
                        ? "bg-green-50/50 border-green-200"
                        : active.currentStage === "DEAN_APPROVAL"
                          ? "bg-white border-blue-400 ring-2 ring-blue-100"
                          : active.deanApproval?.status === "REJECTED"
                            ? "bg-red-50/50 border-red-200"
                            : "bg-white/50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${active.currentStage === "DEAN_APPROVAL" ? "text-blue-600" : "text-slate-400"}`}
                      >
                        Step 2: DEAN
                      </span>
                      <Badge
                        variant={
                          active.deanApproval?.status === "APPROVED"
                            ? "success"
                            : active.deanApproval?.status === "REJECTED"
                              ? "danger"
                              : active.currentStage === "DEAN_APPROVAL"
                                ? "warning"
                                : "default"
                        }
                        className="text-[9px] px-1.5 h-4"
                      >
                        {active.deanApproval?.status || "PENDING"}
                      </Badge>
                    </div>
                    {active.deanApproval?.status === "APPROVED" ? (
                      <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100 italic line-clamp-2">
                        {active.deanApproval.comment
                          ? `"${active.deanApproval.comment}"`
                          : "Recommended by Dean"}
                      </p>
                    ) : active.deanApproval?.status === "REJECTED" ? (
                      <p className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100 italic">
                        {active.deanApproval.comment
                          ? `"${active.deanApproval.comment}"`
                          : "Rejected by Dean"}
                      </p>
                    ) : active.deanApproval?.status === "N/A" ? (
                      <p className="text-[10px] italic text-slate-400">
                        Stage bypassed (Official Application)
                      </p>
                    ) : (
                      <p
                        className={`text-[10px] italic ${active.currentStage === "DEAN_APPROVAL" ? "text-blue-500 font-medium" : "text-slate-400 opacity-50"}`}
                      >
                        {active.currentStage === "DEAN_APPROVAL"
                          ? "Awaiting Dean's endorsement..."
                          : "Pending Step 2"}
                      </p>
                    )}
                  </div>

                  {/* VC Tracking */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      active.vcApproval?.status === "APPROVED"
                        ? "bg-green-50/50 border-green-200"
                        : active.currentStage === "VC_APPROVAL"
                          ? "bg-white border-blue-400 ring-2 ring-blue-100"
                          : active.vcApproval?.status === "REJECTED"
                            ? "bg-red-50/50 border-red-200"
                            : "bg-white/50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${active.currentStage === "VC_APPROVAL" ? "text-blue-600" : "text-slate-400"}`}
                      >
                        Step 3: VC
                      </span>
                      <Badge
                        variant={
                          active.vcApproval?.status === "APPROVED"
                            ? "success"
                            : active.vcApproval?.status === "REJECTED"
                              ? "danger"
                              : active.currentStage === "VC_APPROVAL"
                                ? "warning"
                                : "default"
                        }
                        className="text-[9px] px-1.5 h-4"
                      >
                        {active.vcApproval?.status || "PENDING"}
                      </Badge>
                    </div>
                    {active.vcApproval?.status === "APPROVED" ? (
                      <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100 italic line-clamp-2">
                        {active.vcApproval.comment
                          ? `"${active.vcApproval.comment}"`
                          : "Final approval granted by VC"}
                      </p>
                    ) : active.vcApproval?.status === "REJECTED" ? (
                      <p className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100 italic">
                        {active.vcApproval.comment
                          ? `"${active.vcApproval.comment}"`
                          : "Final approval declined by VC"}
                      </p>
                    ) : (
                      <p
                        className={`text-[10px] italic ${active.currentStage === "VC_APPROVAL" ? "text-blue-600 font-medium" : "text-slate-400 opacity-50"}`}
                      >
                        {active.currentStage === "VC_APPROVAL"
                          ? "Awaiting VC's final decision..."
                          : "Pending Step 3"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading history...
            </div>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">No application history found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Type & Period</TableHead>
                  <TableHead>Progress (HOD &gt; Dean &gt; VC)</TableHead>
                  <TableHead>Final Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave: any) => (
                  <TableRow key={leave._id}>
                    <TableCell className="text-slate-500 text-xs">
                      {format(new Date(leave.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium capitalize text-sm">
                        {leave.leaveType?.replace(/_/g, " ") || "N/A"}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {format(new Date(leave.startDate), "MMM dd")} -{" "}
                        {format(new Date(leave.endDate), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            leave.hodApproval?.status === "APPROVED"
                              ? "success"
                              : leave.hodApproval?.status === "REJECTED"
                                ? "danger"
                                : leave.hodApproval?.status === "N/A"
                                  ? "default"
                                  : "warning"
                          }
                          className={`text-[9px] px-1.5 py-0 h-5 ${leave.hodApproval?.status === "N/A" ? "opacity-40" : ""}`}
                        >
                          {leave.hodApproval?.status === "N/A" ? "-" : "HOD"}
                        </Badge>
                        <span className="text-slate-300 text-[10px]">→</span>
                        <Badge
                          variant={
                            leave.deanApproval?.status === "APPROVED"
                              ? "success"
                              : leave.deanApproval?.status === "REJECTED"
                                ? "danger"
                                : leave.deanApproval?.status === "N/A"
                                  ? "default"
                                  : "warning"
                          }
                          className={`text-[9px] px-1.5 py-0 h-5 ${leave.deanApproval?.status === "N/A" ? "opacity-40" : ""}`}
                        >
                          {leave.deanApproval?.status === "N/A" ? "-" : "DEAN"}
                        </Badge>
                        <span className="text-slate-300 text-[10px]">→</span>
                        <Badge
                          variant={
                            leave.vcApproval?.status === "APPROVED"
                              ? "success"
                              : leave.vcApproval?.status === "REJECTED"
                                ? "danger"
                                : "warning"
                          }
                          className="text-[9px] px-1.5 py-0 h-5"
                        >
                          VC
                        </Badge>
                      </div>
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
                        className="font-bold border-2"
                      >
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        title="View Full Details & Letter"
                        onClick={() => setSelectedLeave(leave)}
                        className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-full text-slate-400 transition-all active:scale-95"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        {selectedLeave && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
            {/* Left: Progress & Feedback (Visible on History Page) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Approval Progress
                </h3>

                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {/* HOD Step */}
                  <div className="relative pl-8">
                    <div
                      className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                        selectedLeave.hodApproval?.status === "APPROVED"
                          ? "bg-green-500 border-green-500 text-white"
                          : selectedLeave.hodApproval?.status === "REJECTED"
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-white border-slate-300 text-slate-300"
                      }`}
                    >
                      {selectedLeave.hodApproval?.status === "APPROVED" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        "1"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          HOD Review
                        </h4>
                        <Badge
                          variant={
                            selectedLeave.hodApproval?.status === "APPROVED"
                              ? "success"
                              : selectedLeave.hodApproval?.status === "REJECTED"
                                ? "danger"
                                : "warning"
                          }
                          className="text-[10px]"
                        >
                          {selectedLeave.hodApproval?.status || "PENDING"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        Head of Department
                      </p>
                      {selectedLeave.hodApproval?.comment && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 italic">
                          "{selectedLeave.hodApproval.comment}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DEAN Step */}
                  <div className="relative pl-8">
                    <div
                      className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                        selectedLeave.deanApproval?.status === "APPROVED"
                          ? "bg-green-500 border-green-500 text-white"
                          : selectedLeave.deanApproval?.status === "REJECTED"
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-white border-slate-300 text-slate-300"
                      }`}
                    >
                      {selectedLeave.deanApproval?.status === "APPROVED" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        "2"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          Dean Review
                        </h4>
                        <Badge
                          variant={
                            selectedLeave.deanApproval?.status === "APPROVED"
                              ? "success"
                              : selectedLeave.deanApproval?.status ===
                                  "REJECTED"
                                ? "danger"
                                : "warning"
                          }
                          className="text-[10px]"
                        >
                          {selectedLeave.deanApproval?.status || "PENDING"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        Faculty Dean
                      </p>
                      {selectedLeave.deanApproval?.comment && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 italic">
                          "{selectedLeave.deanApproval.comment}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VC Step */}
                  <div className="relative pl-8">
                    <div
                      className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                        selectedLeave.vcApproval?.status === "APPROVED"
                          ? "bg-green-500 border-green-500 text-white"
                          : selectedLeave.vcApproval?.status === "REJECTED"
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-white border-slate-300 text-slate-300"
                      }`}
                    >
                      {selectedLeave.vcApproval?.status === "APPROVED" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        "3"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          VC Approval
                        </h4>
                        <Badge
                          variant={
                            selectedLeave.vcApproval?.status === "APPROVED"
                              ? "success"
                              : selectedLeave.vcApproval?.status === "REJECTED"
                                ? "danger"
                                : "warning"
                          }
                          className="text-[10px]"
                        >
                          {selectedLeave.vcApproval?.status || "PENDING"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        Vice Chancellor
                      </p>
                      {selectedLeave.vcApproval?.comment && (
                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 italic">
                          "{selectedLeave.vcApproval.comment}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Letter Preview */}
            <div className="lg:col-span-8">
              <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <LeaveLetterPreview user={user} leaveData={selectedLeave} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
