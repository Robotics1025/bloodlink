"use client"

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts"

interface DataPoint {
  month: string
  requests: number
  fulfilled: number
}

export function HospitalRequestChart({ data }: { data: DataPoint[] }) {
  if (!data || data.every((d) => d.requests === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        No request data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gFul" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          labelStyle={{ fontWeight: 700 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Area type="monotone" dataKey="requests"  name="Requests"  stroke="#ef4444" strokeWidth={2} fill="url(#gReq)" dot={{ r: 3, fill: "#ef4444" }} activeDot={{ r: 5 }} />
        <Area type="monotone" dataKey="fulfilled" name="Fulfilled" stroke="#16a34a" strokeWidth={2} fill="url(#gFul)" dot={{ r: 3, fill: "#16a34a" }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
