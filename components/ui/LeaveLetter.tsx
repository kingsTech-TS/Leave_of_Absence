"use client";

import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";

interface LetterPreviewProps {
  user: any;
  leaveData: any;
}

export function LeaveLetterPreview({ user, leaveData }: LetterPreviewProps) {
  const today = format(new Date(), "dd MMMM, yyyy");
  const startDate = leaveData.startDate
    ? format(new Date(leaveData.startDate), "dd MMMM, yyyy")
    : "...";
  const endDate = leaveData.endDate
    ? format(new Date(leaveData.endDate), "dd MMMM, yyyy")
    : "...";

  return (
    <Card className="max-w-3xl mx-auto my-8 shadow-2xl print:shadow-none print:border-none">
      <CardContent className="p-12 text-slate-900 overflow-hidden">
        {/* Header - Formal University Style */}
        <div className="text-center space-y-2 mb-12 border-b-2 border-double border-slate-900 pb-6 uppercase font-serif">
          <h1 className="text-2xl font-bold">
            Ekiti State University, Ado-Ekiti
          </h1>
          <p className="text-sm font-semibold">
            Faculty of {user?.faculty || "..."}
          </p>
          <p className="text-sm font-semibold text-slate-700">
            Department of {user?.department || "..."}
          </p>
          <div className="text-xs italic capitalize">
            Motto: Knowledge for Progress
          </div>
        </div>

        {/* Date and Address */}
        <div className="flex justify-between mb-10 font-serif">
          <div className="text-sm space-y-1">
            <p>
              <strong>From:</strong>
            </p>
            <p className="uppercase">{user?.name}</p>
            <p>
              {user?.role === "STUDENT" ? "Matric No:" : "Staff ID:"}{" "}
              {user?.idNumber}
            </p>
          </div>
          <div className="text-sm text-right">
            <p>
              <strong>Date:</strong> {today}
            </p>
          </div>
        </div>

        <div className="mb-10 text-sm font-serif">
          <p>
            <strong>To:</strong>
          </p>
          <p>Head of Department,</p>
          <p>University of Excellence.</p>
        </div>

        <div className="mb-10 text-sm font-serif">
          <p>
            <strong>To:</strong>
          </p>
          <p>The Dean of Faculty,</p>
          <p>University of Excellence.</p>
        </div>

        <div className="mb-10 text-sm font-serif">
          <p>
            <strong>To:</strong>
          </p>
          <p>The Vice Chancellor,</p>
          <p>University of Excellence.</p>
        </div>

        {/* Subject */}
        <div className="mb-8 text-center text-sm font-bold underline font-serif uppercase">
          APPLICATION FOR{" "}
          {leaveData.leaveType?.replace(/_/g, " ") || "LEAVE OF ABSENCE"}
        </div>

        {/* Body */}
        <div className="space-y-6 text-sm text-justify leading-relaxed font-serif">
          <p>
            I, {user?.name}, with{" "}
            {user?.role === "STUDENT"
              ? "matriculation number"
              : "staff identification number"}{" "}
            {user?.idNumber}, hereby wish to formally apply for a{" "}
            {leaveData.leaveType?.replace(/_/g, " ") || "leave of absence"}
            {leaveData.academicSession
              ? ` for the ${leaveData.academicSession} academic session`
              : ""}
            .
          </p>

          <p>
            I am requesting this leave to commence from{" "}
            <strong>{startDate}</strong> until <strong>{endDate}</strong>. The
            purpose for this application is due to{" "}
            {leaveData.reason || "personal reasons and official requirements"}.
          </p>

          <p>
            I ensure that I have completed all necessary handovers/academic
            requirements prior to my departure and I look forward to continuing
            my {user?.role === "STUDENT" ? "studies" : "duties"} upon my return
            on <strong>{endDate}</strong>.
          </p>

          <p>Thank you for your favorable consideration of my application.</p>
        </div>

        {/* Signature */}
        <div className="mt-16 space-y-8 font-serif">
          <div className="text-sm">
            <p>Yours Faithfully,</p>
            <div className="h-12 w-32 border-b border-dashed border-slate-400 my-2"></div>
            <p className="font-bold uppercase">{user?.name}</p>
          </div>
        </div>

        {/* Form Controls - Hidden in Print */}
        <div className="mt-12 flex justify-end space-x-4 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
