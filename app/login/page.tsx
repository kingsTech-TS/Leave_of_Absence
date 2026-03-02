import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
      <LoginForm />
    </main>
  );
}
