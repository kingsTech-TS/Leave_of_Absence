"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import {
  ACADEMIC_STAFF_LEAVE_TYPES,
  NON_ACADEMIC_STAFF_LEAVE_TYPES,
  STUDENT_LEAVE_TYPES,
  Role,
  StaffCategory,
} from "@/types";
import { submitLeave } from "@/lib/actions/leave";
import { cn } from "@/lib/utils";

const leaveSchema = z.object({
  leaveType: z.string().min(1, "Please select a leave type"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  academicSession: z.string().optional(),
  staffCategory: z.enum(["ACADEMIC", "NON_ACADEMIC"]).optional(),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveFormProps {
  role: Role;
  initialStaffCategory?: StaffCategory;
  onSuccess?: () => void;
}

export function LeaveForm({
  role,
  initialStaffCategory,
  onSuccess,
}: LeaveFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      staffCategory: (initialStaffCategory as any) || undefined,
    },
  });

  const selectedCategory = watch("staffCategory");

  const leaveTypes = useMemo(() => {
    if (role === "STUDENT") return STUDENT_LEAVE_TYPES;
    if (role === "STAFF") {
      if (selectedCategory === "ACADEMIC") return ACADEMIC_STAFF_LEAVE_TYPES;
      if (selectedCategory === "NON_ACADEMIC")
        return NON_ACADEMIC_STAFF_LEAVE_TYPES;
    }
    return [];
  }, [role, selectedCategory]);

  const onSubmit = async (data: LeaveFormData) => {
    setLoading(true);
    setMessage(null);
    const res = await submitLeave(data);
    setLoading(false);

    if (res.success) {
      setMessage({
        type: "success",
        text: "Application submitted successfully!",
      });
      if (onSuccess) onSuccess();
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-blue-900">Apply for Leave</CardTitle>
        <CardDescription>
          Fill in the details below to submit your application.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {message && (
            <div
              className={cn(
                "p-3 text-sm rounded-md border",
                message.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200",
              )}
            >
              {message.text}
            </div>
          )}

          {role === "STAFF" && (
            <div className="space-y-2">
              <Label htmlFor="staffCategory">Staff Category</Label>
              <Select
                id="staffCategory"
                {...register("staffCategory")}
                className="w-full"
              >
                <option value="">Select Category</option>
                <option value="ACADEMIC">Academic / Teaching Staff</option>
                <option value="NON_ACADEMIC">Non-Academic Staff</option>
              </Select>
              {errors.staffCategory && (
                <p className="text-xs text-red-500">
                  {errors.staffCategory.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select
              id="leaveType"
              {...register("leaveType")}
              className="w-full"
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </Select>
            {errors.leaveType && (
              <p className="text-xs text-red-500">{errors.leaveType.message}</p>
            )}
          </div>

          {role === "STUDENT" && (
            <div className="space-y-2">
              <Label htmlFor="academicSession">Academic Session</Label>
              <Select
                id="academicSession"
                {...register("academicSession")}
                className="w-full"
              >
                <option value="">Select Session</option>
                <option value="2023/2024">2023/2024</option>
                <option value="2024/2025">2024/2025</option>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-xs text-red-500">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-xs text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave</Label>
            <Textarea
              id="reason"
              placeholder="Provide a detailed reason for your leave request..."
              {...register("reason")}
              className="min-h-[120px]"
            />
            {errors.reason && (
              <p className="text-xs text-red-500">{errors.reason.message}</p>
            )}
          </div>
        </CardContent>
        <div className="p-6 pt-0">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Leave Application"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
