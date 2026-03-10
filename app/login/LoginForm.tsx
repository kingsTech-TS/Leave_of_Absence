"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/actions/auth";
import { Eye, EyeOff, LogIn, GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    startTransition(async () => {
      const result = await loginUser({
        email: form.email,
        password: form.password,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      const role = result.role;
      if (role === "OFFICIAL") {
        router.push(redirectTo || "/official");
      } else {
        router.push(redirectTo || `/${role.toLowerCase()}/dashboard`);
      }
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#150E56] via-[#150E56] to-[#7B113A] flex items-center justify-center p-4">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
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
            <h2 className="text-white font-semibold text-lg mb-6">
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
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
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isPending}
                  placeholder="you@university.edu"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
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
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isPending}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-500/20 border border-red-400/30 rounded-xl animate-in fade-in duration-300">
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#7B113A] hover:bg-[#7B113A]/90 text-white font-bold rounded-xl transition-all duration-200 shadow-xl shadow-[#7B113A]/20 hover:scale-[1.01] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer hint */}
            <p className="mt-6 text-center text-xs text-blue-300/60 leading-relaxed">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-400 hover:text-white font-medium underline-offset-4 hover:underline transition-colors"
              >
                Sign up
              </Link>
              <br />
              Access is restricted to registered university members.
              <br />
              Contact your administrator if you cannot log in.
            </p>
          </div>
        </div>

        <p className="text-center text-blue-400/40 text-xs mt-5">
          UniLeave &copy; {new Date().getFullYear()} &mdash; All rights reserved
        </p>
      </div>
    </div>
  );
}
