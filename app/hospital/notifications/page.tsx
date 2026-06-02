import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HospitalNotificationsPage() {
  const session = await auth();
  if (!session || session.user.role !== "hospital") redirect("/login");

  const hospitalId = Number(session.user.id);
  const notifications = await prisma.notification.findMany({
    where: { hospitalId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500">Stay updated on your blood requests and inventory alerts.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Bell className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-base font-medium text-slate-900">No notifications yet</p>
            <p className="text-sm text-slate-500 text-center max-w-sm mt-1">
              When there are updates to your requests or system alerts, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => {
              const isUnread = notif.status === "UNREAD";
              
              let Icon = Info;
              let iconColor = "text-blue-500";
              let iconBg = "bg-blue-50";
              
              if (notif.title.toLowerCase().includes("success") || notif.title.toLowerCase().includes("fulfilled")) {
                Icon = CheckCircle;
                iconColor = "text-green-500";
                iconBg = "bg-green-50";
              } else if (notif.title.toLowerCase().includes("alert") || notif.title.toLowerCase().includes("urgent")) {
                Icon = AlertTriangle;
                iconColor = "text-red-500";
                iconBg = "bg-red-50";
              }

              return (
                <div key={notif.id} className={cn("p-5 flex gap-4 transition-colors hover:bg-slate-50", isUnread && "bg-slate-50/50")}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5", iconBg)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn("text-sm font-semibold", isUnread ? "text-slate-900" : "text-slate-700")}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">
                      {notif.message}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="flex shrink-0 items-center justify-center self-center w-2.5 h-2.5 bg-red-600 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
