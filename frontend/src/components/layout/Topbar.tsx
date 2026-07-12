"use client";

import { useAuthContext } from "@/providers/auth-provider";
import { Bell, Search, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export default function Topbar() {
  const { user } = useAuthContext();
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <header className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 select-none">
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search operations..."
            className="pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500/50 w-64 placeholder-slate-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden lg:inline-block">
          {currentDate}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection status badge */}
        <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
            System Online
          </span>
        </div>

        {/* Action icons */}
        <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" />
        </button>

        {user?.role === "Fleet Manager" && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Control Mode</span>
          </div>
        )}
      </div>
    </header>
  );
}
