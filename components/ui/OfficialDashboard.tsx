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
import { Check, X, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function OfficialDashboardClient() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    setLoading(true);
    const res = await getAllLeaves();
    if (res.success) setLeaves(res.data);
    setLoading(false);
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await updateLeaveStatus(id, status);
    if (res.success) {
      fetchLeaves();
    }
  };

  const filteredLeaves = leaves.filter(
    (l) =>
      l.userId?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      l.leaveType?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Official Management
          </h1>
          <p className="text-slate-500">
            Review and manage all employee/student leave applications.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or type..."
            className="pl-10"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Leave Requests</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-blue-100 text-blue-700">
              {filteredLeaves.length} Records
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeaves.map((leave: any) => (
                  <TableRow key={leave._id}>
                    <TableCell>
                      <div className="font-medium">{leave.userId?.name}</div>
                      <div className="text-xs text-slate-500">
                        {leave.userId?.idNumber}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
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
                      {leave.status === "PENDING" ? (
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() =>
                              handleStatusUpdate(leave._id, "APPROVED")
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleStatusUpdate(leave._id, "REJECTED")
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Actioned
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
