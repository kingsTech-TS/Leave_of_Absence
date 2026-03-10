"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./Card";
import { Badge } from "./Badge";
import { User, Mail, Building, MapPin, Tag, Briefcase } from "lucide-react";

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 text-3xl font-bold mb-4">
              {user.name?.charAt(0)}
            </div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription className="capitalize">
              {user.role.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <Tag className="h-4 w-4 text-slate-400" />
              <span>ID: {user.idNumber}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{user.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
            <CardDescription>
              Academic and organizational information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Faculty
                </p>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <p className="text-slate-900 font-medium">
                    {user.role === "OFFICIAL" && user.officialLevel === "VC"
                      ? "N/A (University Wide)"
                      : user.faculty || "Not Specified"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Department
                </p>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-blue-500" />
                  <p className="text-slate-900 font-medium">
                    {user.role === "OFFICIAL" && user.officialLevel === "VC"
                      ? "N/A (University Wide)"
                      : user.department || "Not Specified"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role
                </p>
                <Badge
                  variant="default"
                  className="bg-blue-50 text-blue-700 capitalize"
                >
                  {user.role.toLowerCase()}
                </Badge>
              </div>
              {user.officialLevel && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Official Rank
                  </p>
                  <Badge className="bg-indigo-50 text-indigo-700">
                    {user.officialLevel}
                  </Badge>
                </div>
              )}
              {(user.role === "STAFF" || user.role === "OFFICIAL") && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Staff Category
                  </p>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-emerald-500" />
                    <p className="text-slate-900 font-medium capitalize">
                      {user.staffCategory?.toLowerCase()?.replace(/_/g, " ") ||
                        "Not Specified"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
