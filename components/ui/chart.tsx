"use client"

import { Line, Bar, Pie } from "recharts"
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import { useTheme } from "next-themes"

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted))",
}

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  valueFormatString?: string // Add this new prop
  className?: string
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["primary"],
  valueFormatter,
  valueFormatString,
  className,
}: ChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Create a formatter function from the string if provided
  const formatter =
    valueFormatter ||
    (valueFormatString
      ? (value: number) => valueFormatString.replace("{value}", value.toString())
      : (value: number) => value.toString())

  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "hsl(var(--border))" : "#eee"} />
        <XAxis
          dataKey={index}
          stroke={isDark ? "hsl(var(--muted-foreground))" : "#888"}
          tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
        />
        <YAxis
          stroke={isDark ? "hsl(var(--muted-foreground))" : "#888"}
          tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
          tickFormatter={formatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "hsl(var(--card))" : "#fff",
            borderColor: isDark ? "hsl(var(--border))" : "#ccc",
            color: isDark ? "hsl(var(--card-foreground))" : "#333",
          }}
          formatter={(value: number) => [formatter(value), ""]}
        />
        <Legend />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={COLORS[colors[i % colors.length] as keyof typeof COLORS] || COLORS.primary}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["primary"],
  valueFormatter = (value: number) => value.toString(),
  className,
}: ChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "hsl(var(--border))" : "#eee"} />
        <XAxis
          dataKey={index}
          stroke={isDark ? "hsl(var(--muted-foreground))" : "#888"}
          tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
        />
        <YAxis
          stroke={isDark ? "hsl(var(--muted-foreground))" : "#888"}
          tick={{ fill: isDark ? "hsl(var(--muted-foreground))" : "#888" }}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "hsl(var(--card))" : "#fff",
            borderColor: isDark ? "hsl(var(--border))" : "#ccc",
            color: isDark ? "hsl(var(--card-foreground))" : "#333",
          }}
          formatter={(value: number) => [valueFormatter(value), ""]}
        />
        <Legend />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={COLORS[colors[i % colors.length] as keyof typeof COLORS] || COLORS.primary}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function PieChart({
  data,
  index,
  categories,
  colors = ["primary", "secondary", "success", "warning", "destructive"],
  valueFormatter = (value: number) => value.toString(),
  className,
}: ChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const category = categories[0]

  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[colors[i % colors.length] as keyof typeof COLORS] || COLORS.primary} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "hsl(var(--card))" : "#fff",
            borderColor: isDark ? "hsl(var(--border))" : "#ccc",
            color: isDark ? "hsl(var(--card-foreground))" : "#333",
          }}
          formatter={(value: number) => [valueFormatter(value), ""]}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
