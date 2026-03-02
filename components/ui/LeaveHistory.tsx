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
import { FileText, Eye, Download } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LeaveLetterPreview } from "@/components/ui/LeaveLetter";

export default function LeaveHistory({ user }: { user: any }) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Leave History</h1>
      </div>

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
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Letter</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave: any) => (
                  <TableRow key={leave._id}>
                    <TableCell className="text-slate-500">
                      {format(new Date(leave.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium capitalize">
                      {leave.leaveType.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(leave.startDate), "MMM dd")} -{" "}
                      {format(new Date(leave.endDate), "MMM dd, yyyy")}
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
                      <button
                        onClick={() => setSelectedLeave(leave)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-blue-700 transition-colors"
                      >
                        <Eye className="h-5 w-5" />
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
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {selectedLeave && (
          <LeaveLetterPreview user={user} leaveData={selectedLeave} />
        )}
      </Modal>
    </div>
  );
}
