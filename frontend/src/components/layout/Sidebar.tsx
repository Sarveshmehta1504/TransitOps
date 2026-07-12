"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
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
  Sun,
  Moon,
} from "lucide-react";
import { useMobileMenu } from "@/providers/mobile-menu-provider";
import { logout } from "@/lib/api/auth";
import { useToast } from "@/providers/toast-provider";

export default function Sidebar() {
  const pathname = usePathname();
  const { role, user, setUser } = useAuthContext();
  const { toast } = useToast();
  const { isLight, toggleTheme } = useTheme();
  const { isOpen, close } = useMobileMenu();

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

  const initials = user
    ? user.name === "Raven K."
      ? "RK"
      : user.name
        ? user.name.split(" ").map((n: string) => n[0]).join("")
        : "?"
    : "?";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={close}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "w-64 flex flex-col shrink-0 transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 will-change-transform",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Header */}
        <div
        className="h-16 flex items-center px-6 gap-3"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20 shrink-0">
          T
        </div>
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          TransitOps
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-1">
        {navItems.map((item) => {
          const isAllowed = role && item.allowed.includes(role);
          if (!isAllowed) return null;

          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 select-none group",
                isActive
                  ? isLight
                    ? "bg-indigo-100 text-indigo-700 shadow-md shadow-indigo-100/50"
                    : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : isLight
                    ? "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 hover:translate-x-1"
                    : "text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 hover:translate-x-1"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                  isActive ? (isLight ? "text-indigo-700" : "text-white") : ""
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile + theme + logout */}
      <div
        className="p-4 flex flex-col gap-3"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        {/* User card */}
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0 select-none">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {user.name}
              </p>
              <p
                className="text-xs truncate flex items-center gap-1"
                style={{ color: "var(--text-muted)" }}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                {user.role}
              </p>
            </div>
          </div>
        )}

        {/* ── Theme Toggle ── */}
        <div
          className="flex items-center justify-between px-2 py-2 rounded-xl transition-all duration-200"
          style={{
            background: isLight ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.03)",
            border: isLight
              ? "1px solid rgba(99,102,241,0.15)"
              : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Label + icon */}
          <div className="flex items-center gap-2">
            <div
              className="transition-all duration-300"
              style={{
                color: isLight ? "#f59e0b" : "#818cf8",
                transform: isLight ? "rotate(0deg) scale(1)" : "rotate(-20deg) scale(0.9)",
                filter: isLight ? "drop-shadow(0 0 6px rgba(245,158,11,0.5))" : "drop-shadow(0 0 6px rgba(129,140,248,0.4))",
              }}
            >
              {isLight ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </div>
            <span
              className="text-xs font-semibold select-none transition-colors duration-300"
              style={{ color: isLight ? "#7c3aed" : "#818cf8" }}
            >
              {isLight ? "Light Mode" : "Dark Mode"}
            </span>
          </div>

          {/* Toggle switch */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className="relative shrink-0 focus:outline-none"
            style={{ width: 40, height: 22 }}
          >
            {/* Track */}
            <span
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                background: isLight
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "rgba(99,102,241,0.2)",
                border: isLight
                  ? "1px solid rgba(99,102,241,0.5)"
                  : "1px solid rgba(99,102,241,0.3)",
                boxShadow: isLight
                  ? "0 0 10px rgba(99,102,241,0.3)"
                  : "none",
              }}
            />
            {/* Knob */}
            <span
              className="absolute top-[3px] rounded-full transition-all duration-300 flex items-center justify-center"
              style={{
                width: 16,
                height: 16,
                left: isLight ? "calc(100% - 19px)" : "3px",
                background: isLight ? "#ffffff" : "#818cf8",
                boxShadow: isLight
                  ? "0 1px 4px rgba(0,0,0,0.2)"
                  : "0 0 8px rgba(129,140,248,0.6)",
                willChange: "left",
              }}
            />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 border border-transparent hover:border-rose-500/10 select-none"
          style={{ color: "var(--text-muted)" }}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
      </aside>
    </>
  );
}
