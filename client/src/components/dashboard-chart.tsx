import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface DashboardChartProps {
  data: Array<{ date: string; value: number }>
  dataKey: string
  color: string
  className?: string
  height?: string
  showGrid?: boolean
  showVerticalLines?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  formatValue?: (value: number) => string
}

export function DashboardChart({ 
  data, 
  dataKey, 
  color, 
  className = "", 
  height = "h-[100px]",
  showGrid = false,
  showVerticalLines = false,
  showXAxis = false,
  showYAxis = false,
  formatValue = (value) => value.toString()
}: DashboardChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: dataKey,
      color: color,
    },
  } satisfies ChartConfig

  return (
    <div className={`w-full ${height} ${className}`}>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-full w-full"
      >
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id={`fill${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={color}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={color}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid 
            vertical={false} 
            horizontal={showGrid || showVerticalLines}
            strokeDasharray="2 2" 
            stroke="#94a3b8"
            opacity={0.8}
          />
          {showXAxis && (
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={10}
              interval={0}
              tickFormatter={(value) => {
                if (typeof value === 'string' && value.includes(' ')) {
                  return value.split(' ')[0].slice(0, 3)
                }
                return value
              }}
              fontSize={12}
            />
          )}
          {showYAxis && (
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatValue}
              fontSize={12}
            />
          )}
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  if (typeof value === 'string' && value.includes(' ')) {
                    return value
                  }
                  return value
                }}
                formatter={(value) => [formatValue(Number(value)), dataKey]}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="value"
            type="monotone"
            fill={`url(#fill${dataKey})`}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
} 