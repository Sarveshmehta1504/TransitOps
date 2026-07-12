import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { MobileMenuProvider } from "@/providers/mobile-menu-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileMenuProvider>
      <div className="flex h-[100dvh] bg-slate-950 overflow-hidden">
        {/* Sidebar component */}
        <Sidebar />

        {/* Dashboard area */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Topbar component */}
          <Topbar />

          {/* Main content scroll region */}
          <main className="flex-1 overflow-y-auto bg-[#090d16] p-4 sm:p-6 md:p-8 overscroll-contain">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </MobileMenuProvider>
  );
}
