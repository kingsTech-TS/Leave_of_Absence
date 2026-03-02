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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: "STUDENT" | "STAFF" | "ADMIN";
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
    { name: "Profile", href: "#", icon: User },
    { name: "Settings", href: "#", icon: Settings },
  ];

  if (role === "ADMIN") {
    links[0].href = "/admin";
    links[1].href = "/admin/all-leaves"; // Example
  }

  return (
    <div className="hidden md:flex h-full w-64 flex-col bg-blue-900 text-white">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight">UniLeave</h2>
        <p className="text-xs text-blue-300">Management System</p>
      </div>
      <nav className="flex-1 space-y-1 px-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-800 text-white"
                  : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-blue-800">
        <LogoutButton />
      </div>
    </div>
  );
}

export function Navbar({ user }: { user: any }) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-slate-900 md:hidden">
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
      router.push("/login");
    });
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-blue-100 hover:bg-red-900/20 hover:text-red-100"
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOut className="h-5 w-5 mr-3" />
      {isPending ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
