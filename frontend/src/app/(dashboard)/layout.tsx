import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar component */}
      <Sidebar />

      {/* Dashboard area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar component */}
        <Topbar />

        {/* Main content scroll region */}
        <main className="flex-1 overflow-y-auto bg-[#090d16] p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
