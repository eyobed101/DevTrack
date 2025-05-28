"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { IconUsers, IconCheck, IconClock, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Types for analytics data
type AnalyticsData = {
  date: string
  completedTasks: number
  activeTasks: number
  timeSpent: number
  teamProductivity: number
  teamCollaboration: number
}

// Fixed mock data generation with consistent results
const generateMockData = (days: number): AnalyticsData[] => {
  const data: AnalyticsData[] = []
  const fixedDate = new Date('2024-06-30') // Fixed reference date
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(fixedDate)
    date.setDate(date.getDate() - i)
    
    // Deterministic "randomness" based on date
    const seed = date.getTime() % 10000
    const baseTasks = 5 + (seed % 10)
    const dayFactor = (date.getDay() === 0 || date.getDay() === 6) ? 0.5 : 1
    const variation = 0.8 + (seed % 40) / 100
    
    data.push({
      date: date.toISOString().split('T')[0],
      completedTasks: Math.floor(baseTasks * dayFactor * variation),
      activeTasks: Math.floor(baseTasks * 1.5 * variation),
      timeSpent: Math.floor(baseTasks * 0.5 * variation),
      teamProductivity: 70 + (seed % 30),
      teamCollaboration: 60 + (seed % 40),
    })
  }
  
  return data
}

// Pre-generate all mock data at module level
const MOCK_DATA = {
  "7d": generateMockData(7),
  "30d": generateMockData(30),
  "90d": generateMockData(90)
}

const chartConfig = {
  completedTasks: {
    label: "Completed Tasks",
    color: "var(--primary)",
    icon: IconCheck
  },
  activeTasks: {
    label: "Active Tasks",
    color: "var(--secondary)",
    icon: IconUsers
  },
  timeSpent: {
    label: "Time Spent (hrs)",
    color: "var(--accent)",
    icon: IconClock
  },
  teamProductivity: {
    label: "Productivity %",
    color: "var(--success)",
    icon: IconTrendingUp
  },
  teamCollaboration: {
    label: "Collaboration %",
    color: "var(--info)",
    icon: IconUsers
  },
} satisfies ChartConfig

// Consistent date formatting
const formatDate = (dateString: string, formatStr: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: formatStr === 'EEE' ? 'short' : undefined,
    timeZone: 'UTC' // Ensure consistent timezone
  }).format(date)
}

export function ChartAreaInteractive() {
  const [isMounted, setIsMounted] = React.useState(false)
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [metric, setMetric] = React.useState<keyof typeof chartConfig>("completedTasks")

  React.useEffect(() => {
    setIsMounted(true)
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  if (!isMounted) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Collaboration Analytics</CardTitle>
          <Skeleton className="h-[250px] w-full" />
        </CardHeader>
      </Card>
    )
  }

  const filteredData = MOCK_DATA[timeRange as keyof typeof MOCK_DATA]
  const currentMetricConfig = chartConfig[metric]

  const calculateTrend = () => {
    if (filteredData.length < 2) return 0
    const firstValue = filteredData[0][metric]
    const lastValue = filteredData[filteredData.length - 1][metric]
    if (firstValue === 0) return 0
    return ((lastValue - firstValue) / firstValue) * 100
  }

  const trend = calculateTrend()
  const totalValue = filteredData.reduce((sum, item) => sum + item[metric], 0)
  const avgValue = Math.round(totalValue / filteredData.length)

  return (
    <Card className="@container/card">
      <CardHeader className="space-y-4">
    {/* Top row - Title and Metric Selector */}
    <div className="flex flex-col gap-4 @sm/card:flex-row @sm/card:items-center @sm/card:justify-between">
      <div className="space-y-1">
        <CardTitle>Collaboration Analytics</CardTitle>
        <CardDescription>
          {currentMetricConfig.label} over time
        </CardDescription>
      </div>
      
      <div className="w-full @sm/card:w-auto">
        <Select value={metric} onValueChange={(v) => setMetric(v as keyof typeof chartConfig)}>
          <SelectTrigger className="w-full @sm/card:w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(chartConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center">
                  {config.icon && React.createElement(config.icon, { className: "h-4 w-4 mr-1" })}
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Bottom row - Stats and Time Controls */}
    <CardAction className="flex flex-col gap-4 @sm/card:flex-row @sm/card:items-center @sm/card:justify-between">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-2xl font-semibold tabular-nums">
            {avgValue}
            {(metric === 'teamProductivity' || metric === 'teamCollaboration') ? '%' : ''}
          </div>
          {/* <div className="text-sm text-muted-foreground">Average</div> */}
        </div>
        <Badge variant={trend >= 0 ? "outline" : "destructive"}>
          {trend >= 0 ? <IconTrendingUp className="h-4 w-4 mr-1" /> : <IconTrendingDown className="h-4 w-4 mr-1" />}
          {Math.abs(trend).toFixed(1)}%
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          value={timeRange}
          onValueChange={setTimeRange}
          variant="outline"
          className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
        >
          <ToggleGroupItem value="90d">3 Months</ToggleGroupItem>
          <ToggleGroupItem value="30d">30 Days</ToggleGroupItem>
          <ToggleGroupItem value="7d">7 Days</ToggleGroupItem>
        </ToggleGroup>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
            size="sm"
            aria-label="Select time range"
          >
            <SelectValue placeholder="30 Days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              3 Months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              30 Days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              7 Days
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardAction>
  </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={currentMetricConfig.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={currentMetricConfig.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => formatDate(value, timeRange === "7d" ? "EEE" : "MMM d")}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDate(value, "MMM d, yyyy")}
                  indicator="dot"
                  // If ChartTooltipContent supports a "formatter" or similar prop, use it; otherwise, handle formatting inside the component.
                />
              }
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={currentMetricConfig.color}
              fill="url(#fillColor)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
          <span className="text-sm">Completed Tasks: {filteredData.reduce((sum, item) => sum + item.completedTasks, 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--secondary)" }} />
          <span className="text-sm">Active Tasks: {filteredData.reduce((sum, item) => sum + item.activeTasks, 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
          <span className="text-sm">Total Hours: {filteredData.reduce((sum, item) => sum + item.timeSpent, 0)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}