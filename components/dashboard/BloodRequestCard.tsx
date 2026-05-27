import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Droplet } from "lucide-react";
import { bloodGroupLabel, urgencyColor, statusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BloodRequestCardProps {
  bloodGroup: string;
  unitsRequired: number;
  urgencyLevel: string;
  status: string;
  location: string;
  hospitalName?: string;
  reason?: string | null;
  createdAt: Date | string;
  action?: React.ReactNode;
}

export function BloodRequestCard({
  bloodGroup,
  unitsRequired,
  urgencyLevel,
  status,
  location,
  hospitalName,
  reason,
  createdAt,
  action,
}: BloodRequestCardProps) {
  const date = new Date(createdAt);
  const timeAgo = getTimeAgo(date);

  return (
    <Card
      className={cn(
        "border shadow-sm",
        urgencyLevel === "CRITICAL" && "border-red-200 bg-red-50/30"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl shrink-0">
              <span className="text-red-700 font-bold text-sm">{bloodGroupLabel(bloodGroup)}</span>
            </div>
            <div className="min-w-0">
              {hospitalName && (
                <p className="font-semibold text-gray-900 text-sm truncate">{hospitalName}</p>
              )}
              <p className="text-sm text-gray-600">
                {unitsRequired} unit{unitsRequired > 1 ? "s" : ""} needed
              </p>
              {reason && (
                <p className="text-xs text-gray-400 truncate mt-0.5">{reason}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge className={cn("text-xs font-medium border", urgencyColor(urgencyLevel))}>
              {urgencyLevel}
            </Badge>
            <Badge className={cn("text-xs font-medium border-0", statusColor(status))}>
              {status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>
        {action && <div className="mt-3">{action}</div>}
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}
