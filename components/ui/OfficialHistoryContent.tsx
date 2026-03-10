"use client";

import { useState } from "react";
import LeaveHistory from "@/components/ui/LeaveHistory";
import ProcessedHistory from "@/components/ui/ProcessedHistory";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, ClipboardList } from "lucide-react";

export default function OfficialHistoryContent({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"PERSONAL" | "PROCESSED">(
    "PERSONAL",
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            University Official History
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your personal leave requests and track applications you've
            processed.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("PERSONAL")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "PERSONAL"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            My Applications
          </button>
          <button
            onClick={() => setActiveTab("PROCESSED")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "PROCESSED"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Applications I've Processed
          </button>
        </div>
      </div>

      <div className="mt-6 border-t pt-8">
        {activeTab === "PERSONAL" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                Personal Leave History
              </h2>
              <Badge className="bg-slate-100 text-slate-600 border-none font-bold">
                Role: {user.officialLevel}
              </Badge>
            </div>
            <LeaveHistory user={user} hideHeader={true} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                Processed Applications History
              </h2>
              <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold">
                Admin Activity
              </Badge>
            </div>
            <ProcessedHistory user={user} />
          </div>
        )}
      </div>
    </div>
  );
}
