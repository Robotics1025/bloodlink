"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  requests: {
    label: "Requests",
    color: "#e13a48", // Red
  },
  fulfilled: {
    label: "Fulfilled",
    color: "#10b981", // Green
  },
} satisfies ChartConfig

// Simulated monthly data
const chartData = [
  { month: "Jan", requests: 110, fulfilled: 60 },
  { month: "Feb", requests: 145, fulfilled: 100 },
  { month: "Mar", requests: 180, fulfilled: 130 },
  { month: "Apr", requests: 130, fulfilled: 90 },
  { month: "May", requests: 190, fulfilled: 145 },
  { month: "Jun", requests: 180, fulfilled: 130 },
  { month: "Jul", requests: 220, fulfilled: 160 },
  { month: "Aug", requests: 250, fulfilled: 210 },
  { month: "Sep", requests: 230, fulfilled: 160 },
  { month: "Oct", requests: 170, fulfilled: 120 },
  { month: "Nov", requests: 240, fulfilled: 170 },
  { month: "Dec", requests: 300, fulfilled: 240 },
]

export function AdminRequestChart() {
  const [range, setRange] = React.useState("12")
  const sliced = chartData.slice(-parseInt(range))

  return (
    <Card className="shadow-sm border-slate-100 rounded-2xl">
      <CardHeader className="flex items-start sm:items-center gap-2 space-y-0 border-b-0 pb-2 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="text-lg font-bold text-[#0a1c35]">Blood Request Trends</CardTitle>
          <CardDescription className="text-xs text-slate-500">Monthly requests vs fulfilled units across all hospitals</CardDescription>
        </div>
        <Select value={range} onValueChange={(v) => v && setRange(v)}>
          <SelectTrigger className="w-[140px] rounded-lg text-xs h-8 sm:ml-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs">
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-4 sm:px-6 sm:pb-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart data={sliced} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="0" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={12} 
              tick={{ fontSize: 11, fill: "#64748b" }} 
              width={40} 
            />
            <ChartTooltip
              cursor={{ stroke: "#e2e8f0", strokeWidth: 1, strokeDasharray: "4 4" }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="plainline" 
              iconSize={12}
              wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}
            />
            <Line
              dataKey="requests"
              type="monotone"
              stroke="var(--color-requests)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-requests)", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="fulfilled"
              type="monotone"
              stroke="var(--color-fulfilled)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-fulfilled)", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

