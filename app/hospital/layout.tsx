"use client";

import { SessionProvider } from "next-auth/react";
import { HospitalSidebar } from "@/components/layout/HospitalSidebar";
import { TopNav } from "@/components/layout/TopNav";
import { HospitalLayoutProvider, useHospitalLayout } from "@/contexts/hospital-layout-context";
import { PostRequestSheet } from "@/components/hospital-post-request-sheet";

function HospitalShell({ children }: { children: React.ReactNode }) {
  const { postRequestOpen, setPostRequestOpen } = useHospitalLayout();
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <HospitalSidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
      <PostRequestSheet
        open={postRequestOpen}
        onOpenChange={setPostRequestOpen}
      />
    </div>
  );
}

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HospitalLayoutProvider>
        <HospitalShell>{children}</HospitalShell>
      </HospitalLayoutProvider>
    </SessionProvider>
  );
}
