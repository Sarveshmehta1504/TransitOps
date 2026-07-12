"use client";

import { useAuthContext } from "@/providers/auth-provider";
import { Bell, Search, X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "warning" as const,
    title: "Vehicle NY-810-F overdue",
    body: "Ford F-550 scheduled maintenance is 3 days overdue.",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    type: "info" as const,
    title: "New dispatch assigned",
    body: "Trip TR004 has been dispatched to driver Elena Rostova.",
    time: "18m ago",
    unread: true,
  },
  {
    id: 3,
    type: "success" as const,
    title: "Trip TR002 completed",
    body: "Houston to Dallas Freight Terminal delivered successfully.",
    time: "1h ago",
    unread: false,
  },
  {
    id: 4,
    type: "info" as const,
    title: "Driver license expiry",
    body: "Marcus Vance CDL expires in 14 days. Renewal required.",
    time: "3h ago",
    unread: false,
  },
];

const typeIcon = {
  warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />,
  info: <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />,
  success: <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />,
};

export default function Topbar() {
  const { user } = useAuthContext();
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const dismiss = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const initials = user
    ? user.name === "Raven K."
      ? "RK"
      : user.name.split(" ").map((n) => n[0]).join("")
    : "?";

  return (
    <header className="h-16 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 select-none">
      {/* Left: Search + Date */}
      <div className="flex items-center gap-5">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500/60 w-60 placeholder-slate-600"
          />
        </div>
        <span className="text-xs text-slate-600 font-medium hidden lg:inline-block">
          {currentDate}
        </span>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2.5 text-slate-500 hover:text-slate-200 transition-colors bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-slate-700"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <span className="text-sm font-semibold text-slate-200">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-600">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 border-b border-slate-900 last:border-0 transition-colors ${
                        n.unread ? "bg-indigo-600/5" : "bg-transparent"
                      } hover:bg-slate-900/60`}
                    >
                      {typeIcon[n.type]}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-snug ${n.unread ? "text-slate-200" : "text-slate-400"}`}>
                            {n.title}
                          </p>
                          <button
                            onClick={() => dismiss(n.id)}
                            className="text-slate-700 hover:text-slate-500 shrink-0 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-[9px] text-slate-700 mt-1 font-mono">{n.time}</p>
                      </div>
                      {n.unread && (
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-slate-900">
                <button className="w-full text-center text-[10px] text-slate-600 hover:text-slate-400 transition-colors font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User block */}
        {user && (
          <div className="flex items-center gap-2.5 border-l border-slate-900 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-600 font-medium mt-1">{user.role}</p>
            </div>
            <div className="h-8 w-8 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-[11px] shrink-0">
              {initials}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
