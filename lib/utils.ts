import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function bloodGroupLabel(bg: string): string {
  const map: Record<string, string> = {
    A_POS: "A+",
    A_NEG: "A−",
    B_POS: "B+",
    B_NEG: "B−",
    AB_POS: "AB+",
    AB_NEG: "AB−",
    O_POS: "O+",
    O_NEG: "O−",
  };
  return map[bg] ?? bg;
}

export function bloodGroupFromLabel(label: string): string {
  const map: Record<string, string> = {
    "A+": "A_POS",
    "A−": "A_NEG",
    "B+": "B_POS",
    "B−": "B_NEG",
    "AB+": "AB_POS",
    "AB−": "AB_NEG",
    "O+": "O_POS",
    "O−": "O_NEG",
  };
  return map[label] ?? label;
}

export function urgencyColor(level: string): string {
  if (level === "CRITICAL") return "bg-red-100 text-red-700 border-red-300";
  if (level === "URGENT") return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-blue-100 text-blue-700 border-blue-300";
}

export function statusColor(status: string): string {
  if (status === "APPROVED" || status === "FULFILLED")
    return "bg-green-100 text-green-700";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
  if (status === "PARTIAL") return "bg-blue-100 text-blue-700";
  if (status === "CANCELLED") return "bg-gray-100 text-gray-700";
  if (status === "CONFIRMED") return "bg-green-100 text-green-700";
  if (status === "COMPLETED") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
}

export function hospitalStatusColor(status: string): string {
  if (status === "APPROVED") return "bg-green-100 text-green-700";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
  if (status === "DISABLED") return "bg-gray-100 text-gray-500";
  return "bg-gray-100 text-gray-700";
}

export function driveStatusColor(status: string): string {
  if (status === "PUBLISHED") return "bg-green-100 text-green-700";
  if (status === "DRAFT") return "bg-gray-100 text-gray-600";
  if (status === "CANCELLED") return "bg-red-100 text-red-700";
  if (status === "COMPLETED") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
}

export function inventoryStatusColor(units: number): { color: string; label: string } {
  if (units === 0) return { color: "bg-red-100 text-red-700", label: "Out of Stock" };
  if (units <= 5) return { color: "bg-red-100 text-red-600", label: "Critical Low" };
  if (units <= 10) return { color: "bg-yellow-100 text-yellow-700", label: "Low Stock" };
  return { color: "bg-green-100 text-green-700", label: "Adequate" };
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export const BLOOD_GROUPS = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A−" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B−" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB−" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O−" },
];
