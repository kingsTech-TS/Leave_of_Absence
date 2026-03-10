"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import {
  LogOut,
  User,
  Bell,
  ChevronLeft,
  LayoutDashboard,
  History,
  Settings,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: "STUDENT" | "STAFF" | "OFFICIAL";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    {
      name: "Dashboard",
      href: `/${role.toLowerCase()}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: "Leave History",
      href: `/${role.toLowerCase()}/history`,
      icon: History,
    },
    { name: "Profile", href: `/${role.toLowerCase()}/profile`, icon: User },
    { name: "Settings", href: "#", icon: Settings },
  ];

  if (role === "OFFICIAL") {
    links[0].name = "Official Dashboard";
    links[0].href = "/official";

    // Add Pending Approvals link
    links.splice(1, 1, {
      name: "Pending Approvals",
      href: "/official/approvals",
      icon: History,
    });

    // Add Apply for Leave link (VC will be redirected)
    links.splice(2, 0, {
      name: "Apply for Leave",
      href: "/official/apply",
      icon: User,
    });
  }

  return (
    <div className="hidden md:flex h-full w-64 flex-col bg-[#150E56] text-white border-r border-[#1597BB]/20">
      <div className="p-6">
        <div className="flex items-center space-x-3 bg-white p-2.5 rounded-2xl shadow-sm border border-[#1597BB]/20">
          <div className="bg-[#7B113A] p-2 rounded-xl shadow-inner">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#7B113A] leading-none">
              UniLeave
            </h2>
            <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-0.5 whitespace-nowrap">
              University Management
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#7B113A] text-white shadow-lg shadow-[#7B113A]/20"
                  : "text-blue-100 hover:bg-[#1597BB]/20 hover:text-[#8FD6E1]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#1597BB]/10">
        <LogoutButton />
      </div>
    </div>
  );
}

export function Navbar({ user }: { user: any }) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center space-x-2 md:hidden">
        <div className="bg-[#7B113A] p-1.5 rounded-lg">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-lg font-black text-[#7B113A] tracking-tight">
          UniLeave
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      const CORE_URL =
        process.env.NEXT_PUBLIC_CORE_URL || "https://eksucore.vercel.app";
      // Redirect to local login page (local auth mode), fall back to Core if needed
      window.location.href = "/login";
    });
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-indigo-100 hover:bg-rose-950/40 hover:text-rose-200 border border-transparent hover:border-rose-900/30"
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOut className="h-5 w-5 mr-3 text-[#1597BB]" />
      {isPending ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
