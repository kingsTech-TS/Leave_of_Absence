"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Select } from "../ui/Select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { loginUser } from "@/lib/actions/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STAFF", "STUDENT", "ADMIN"]),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "STUDENT" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");
    const res = await loginUser(data);
    setLoading(false);

    if (res.success) {
      if (res.role === "ADMIN") router.push("/admin");
      else router.push(`/${res.role?.toLowerCase()}/dashboard`);
    } else {
      setError(res.message);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-800">
      <CardHeader className="space-y-1 text-center pb-8 border-b border-slate-100">
        <h1 className="text-3xl font-bold tracking-tight text-blue-900">
          University Portal
        </h1>
        <CardDescription className="text-sm">
          Sign in to Leave Management System
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Sign in as</Label>
            <Select
              id="role"
              {...register("role")}
              className="w-full border-slate-300"
            >
              <option value="STUDENT">Student</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrator</option>
            </Select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@uni.edu"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-slate-50 rounded-b-xl border-t border-slate-100 pt-6">
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="text-xs text-slate-500 text-center">
            Demo Users: student@uni.edu, staff@uni.edu, admin@uni.edu (pwd:
            password123)
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
