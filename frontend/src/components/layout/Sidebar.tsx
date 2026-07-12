"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import {
  Truck,
  Users,
  Compass,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { logout } from "@/lib/api/auth";
import { useToast } from "@/providers/toast-provider";

export default function Sidebar() {
  const pathname = usePathname();
  const { role, user, setUser } = useAuthContext();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    toast("Logged out successfully", "info");
    window.location.href = "/login";
  };

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, allowed: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] },
    { label: "Fleet", href: "/vehicles", icon: Truck, allowed: ["Fleet Manager", "Dispatcher", "Financial Analyst"] },
    { label: "Drivers", href: "/drivers", icon: Users, allowed: ["Fleet Manager", "Safety Officer"] },
    { label: "Trips", href: "/trips", icon: Compass, allowed: ["Dispatcher", "Safety Officer"] },
    { label: "Maintenance", href: "/maintenance", icon: Wrench, allowed: ["Fleet Manager"] },
    { label: "Fuel & Expenses", href: "/fuel-expenses", icon: Fuel, allowed: ["Financial Analyst"] },
    { label: "Analytics", href: "/reports", icon: BarChart3, allowed: ["Fleet Manager", "Financial Analyst"] },
    { label: "Settings", href: "/settings/users", icon: Settings, allowed: ["Fleet Manager"] },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col shrink-0">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-900 gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20 shrink-0">
          T
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          TransitOps
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-1">
        {navItems.map((item) => {
          const isAllowed = role && item.allowed.includes(role);
          if (!isAllowed) return null;

          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 select-none group",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-slate-900 flex flex-col gap-3">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-950 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                {user.role}
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/10 select-none"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
