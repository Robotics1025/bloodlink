"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
    label: "Blood Requests",
    color: "var(--color-chart-1)",
  },
  fulfilled: {
    label: "Fulfilled",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

// Simulated monthly data — in production this would come from the DB
const chartData = [
  { month: "Jan", requests: 12, fulfilled: 8 },
  { month: "Feb", requests: 19, fulfilled: 14 },
  { month: "Mar", requests: 25, fulfilled: 21 },
  { month: "Apr", requests: 18, fulfilled: 15 },
  { month: "May", requests: 31, fulfilled: 26 },
  { month: "Jun", requests: 27, fulfilled: 22 },
  { month: "Jul", requests: 34, fulfilled: 30 },
  { month: "Aug", requests: 42, fulfilled: 38 },
  { month: "Sep", requests: 38, fulfilled: 32 },
  { month: "Oct", requests: 29, fulfilled: 24 },
  { month: "Nov", requests: 45, fulfilled: 41 },
  { month: "Dec", requests: 52, fulfilled: 47 },
]

export function AdminRequestChart() {
  const [range, setRange] = React.useState("12")
  const sliced = chartData.slice(-parseInt(range))

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Blood Request Trends</CardTitle>
          <CardDescription>Monthly requests vs fulfilled across all hospitals</CardDescription>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[140px] rounded-lg sm:ml-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={sliced}>
            <defs>
              <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillFulfilled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={4} tick={{ fontSize: 11 }} width={28} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="requests"
              type="monotone"
              fill="url(#fillRequests)"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="fulfilled"
              type="monotone"
              fill="url(#fillFulfilled)"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
