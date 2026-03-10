"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions/auth";
import {
  Eye,
  EyeOff,
  UserPlus,
  GraduationCap,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT" as "STUDENT" | "STAFF" | "OFFICIAL",
    idNumber: "",
    department: "",
    faculty: "",
    officialLevel: "HOD" as string | null,
    staffCategory: "ACADEMIC" as string | null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newState = { ...prev, [name]: value };

      // Reset dependent fields when role changes
      if (name === "role") {
        if (value === "OFFICIAL") {
          newState.officialLevel = "HOD";
          newState.staffCategory = null;
        } else if (value === "STAFF") {
          newState.staffCategory = "ACADEMIC";
          newState.officialLevel = null;
        } else {
          newState.officialLevel = null;
          newState.staffCategory = null;
        }
      }

      return newState;
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isVC = form.role === "OFFICIAL" && form.officialLevel === "VC";

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.idNumber ||
      (!isVC && (!form.department || !form.faculty))
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Additional validation for special roles
    if (form.role === "STAFF" && !form.staffCategory) {
      setError("Please select a staff category.");
      return;
    }
    if (form.role === "OFFICIAL" && !form.officialLevel) {
      setError("Please select an official level.");
      return;
    }

    let submissionForm = { ...form };
    if (isVC) {
      submissionForm.faculty = "N/A";
      submissionForm.department = "N/A";
    }

    startTransition(async () => {
      const result = await registerUser(submissionForm as any);

      if (result.success) {
        const role = result.role;
        if (role === "OFFICIAL") {
          router.push("/official");
        } else {
          router.push(`/${role.toLowerCase()}/dashboard`);
        }
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#150E56] via-[#150E56] to-[#7B113A] flex items-center justify-center p-4 py-12">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Glass card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header band */}
          <div className="bg-white p-8 text-center border-b border-[#1597BB]/10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7B113A] rounded-2xl mb-4 shadow-xl shadow-[#7B113A]/20">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-[#7B113A] tracking-tighter">
              UniLeave
            </h1>
            <p className="text-[#1597BB] text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
              University Management
            </p>
          </div>

          {/* Form body */}
          <div className="p-8">
            <div className="mb-6">
              <Link
                href="/login"
                className="inline-flex items-center text-blue-300 hover:text-white text-sm transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to login
              </Link>
              <h2 className="text-white font-semibold text-lg">
                Personal & Academic Details
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-blue-100"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isPending}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-blue-100"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isPending}
                    placeholder="john@university.edu"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-blue-100"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      disabled={isPending}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 pr-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-blue-100"
                  >
                    Account Type
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={isPending}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60 [&>option]:text-slate-900"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="STAFF">Staff Member</option>
                    <option value="OFFICIAL">University Official</option>
                  </select>
                </div>

                {/* Official Level (Only for Officials) - Moved Up */}
                {form.role === "OFFICIAL" && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="officialLevel"
                      className="block text-sm font-medium text-blue-100"
                    >
                      Official Role
                    </label>
                    <select
                      id="officialLevel"
                      name="officialLevel"
                      value={form.officialLevel || "HOD"}
                      onChange={handleChange}
                      disabled={isPending}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60 [&>option]:text-slate-900"
                    >
                      <option value="HOD">Head of Department (HOD)</option>
                      <option value="DEAN">Dean of Faculty</option>
                      <option value="VC">Vice Chancellor (VC)</option>
                    </select>
                  </div>
                )}

                {/* Staff Category (Only for Staff) - Moved Up */}
                {form.role === "STAFF" && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="staffCategory"
                      className="block text-sm font-medium text-blue-100"
                    >
                      Staff Category
                    </label>
                    <select
                      id="staffCategory"
                      name="staffCategory"
                      value={form.staffCategory || "ACADEMIC"}
                      onChange={handleChange}
                      disabled={isPending}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60 [&>option]:text-slate-900"
                    >
                      <option value="ACADEMIC">Academic / Teaching</option>
                      <option value="NON_ACADEMIC">Non-Academic</option>
                    </select>
                  </div>
                )}

                {/* ID Number */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="idNumber"
                    className="block text-sm font-medium text-blue-100"
                  >
                    {form.role === "STUDENT"
                      ? "Matric Number"
                      : "Staff/Official ID"}
                  </label>
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    value={form.idNumber}
                    onChange={handleChange}
                    disabled={isPending}
                    placeholder={
                      form.role === "STUDENT" ? "2023/1234" : "STAFF-567"
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>

                {/* Conditional Fields: Faculty/Department */}
                {!(form.role === "OFFICIAL" && form.officialLevel === "VC") && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="faculty"
                        className="block text-sm font-medium text-blue-100"
                      >
                        Faculty
                      </label>
                      <input
                        id="faculty"
                        name="faculty"
                        type="text"
                        value={form.faculty}
                        onChange={handleChange}
                        disabled={isPending}
                        placeholder="Science"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                      />
                    </div>

                    <div
                      className={`space-y-1.5 ${form.role === "STUDENT" ? "md:col-span-2" : "md:col-span-1"}`}
                    >
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-blue-100"
                      >
                        Department
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        value={form.department}
                        onChange={handleChange}
                        disabled={isPending}
                        placeholder="Computer Science"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-500/20 border border-red-400/30 rounded-xl animate-in fade-in duration-300">
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#7B113A] hover:bg-[#7B113A]/90 text-white font-bold rounded-xl transition-all duration-200 shadow-xl shadow-[#7B113A]/20 hover:scale-[1.01] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-blue-400/40 text-xs mt-6">
          UniLeave &copy; {new Date().getFullYear()} &mdash; All rights reserved
        </p>
      </div>
    </div>
  );
}
