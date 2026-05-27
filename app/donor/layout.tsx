import { SessionProvider } from "next-auth/react";
import { DonorSidebar } from "@/components/layout/DonorSidebar";
import { DonorTopNav } from "@/components/layout/DonorTopNav";

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <DonorSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DonorTopNav />
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
