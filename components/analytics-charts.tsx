"use client";

/*
 * Analytics visuals in the sticker-book language: stage-coded donut,
 * pastel company bars, gradient activity area, trackless funnel rows.
 * Theme-aware via next-themes; tooltips are bordered cards, never default.
 */
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { useTheme } from "next-themes";
import { StatusStamp } from "@/components/status-stamp";

const LIGHT = {
  ink: "#141414",
  marigold: "#E9A100",
  mint: "#2E9E77",
  sky: "#2F7FD1",
  coral: "#D9534A",
  sand: "#B9AE97",
  grid: "#E5E0D2",
  tick: "#6B6259",
  card: "#FFFFFF",
  areaFill: "#FFB800",
};

const DARK = {
  ink: "#FFFDF7",
  marigold: "#FFB800",
  mint: "#5CC99A",
  sky: "#6AADEB",
  coral: "#F0705F",
  sand: "#8A8578",
  grid: "rgba(255,253,247,0.12)",
  tick: "#B9B9C2",
  card: "#1E1E1E",
  areaFill: "#FFB800",
};

const STAGE_COLORS: Record<string, (keyof typeof LIGHT)[]> = {
  Applied: ["ink", "ink"],
  Screening: ["sky", "sky"],
  Interview: ["marigold", "marigold"],
  Offer: ["mint", "mint"],
  Rejected: ["sand", "sand"],
};

function usePalette() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? DARK : LIGHT;
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  palette,
}: {
  active?: boolean;
  payload?: { value: number | string; name?: string; dataKey?: string | number }[];
  label?: string;
  formatter: (value: number) => string;
  palette: typeof LIGHT;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[10px] border-2 px-3 py-2 text-sm font-medium shadow-[4px_4px_0_rgba(20,20,20,0.9)]"
      style={{ backgroundColor: palette.card, borderColor: palette.ink, color: palette.ink }}
    >
      {label && <p className="font-bold">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="tnum">
          {p.name ? `${p.name}: ` : ""}
          {formatter(Number(p.value))}
        </p>
      ))}
    </div>
  );
}

export function StageDonut({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const palette = usePalette();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="relative h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={64}
            outerRadius={92}
            paddingAngle={3}
            cornerRadius={6}
            strokeWidth={0}
          >
            {data.map((entry, i) => {
              const [key] = STAGE_COLORS[entry.name] ?? ["ink", "ink"];
              return <Cell key={`cell-${i}`} fill={palette[key]} />;
            })}
          </Pie>
          <Tooltip
            content={
              <ChartTooltip
                formatter={(v) => `${v} application${v === 1 ? "" : "s"}`}
                palette={palette}
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display tnum text-4xl font-bold" style={{ color: palette.ink }}>
          {total}
        </p>
        <p className="text-xs" style={{ color: palette.tick }}>
          total
        </p>
      </div>
    </div>
  );
}

export function StageLegend({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const palette = usePalette();
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  return (
    <ul className="mt-2 space-y-2">
      {data.map((d) => {
        const [key] = STAGE_COLORS[d.name] ?? ["ink", "ink"];
        return (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-[4px] border border-black/20"
              style={{ backgroundColor: palette[key] }}
            />
            <span className="font-medium" style={{ color: palette.ink }}>
              {d.name}
            </span>
            <span className="tnum ml-auto" style={{ color: palette.tick }}>
              {d.value} ({Math.round((d.value / total) * 100)}%)
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const BAR_CYCLE: (keyof typeof LIGHT)[] = ["marigold", "mint", "sky", "coral", "ink"];

export function CompanyBars({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const palette = usePalette();
  const rows = data.slice(0, 8);
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fill: palette.tick, fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={
              <ChartTooltip
                formatter={(v) => `${v} application${v === 1 ? "" : "s"}`}
                palette={palette}
              />
            }
          />
          <Bar dataKey="value" barSize={18} radius={[4, 10, 10, 4]}>
            {rows.map((_, i) => (
              <Cell key={`cell-${i}`} fill={palette[BAR_CYCLE[i % BAR_CYCLE.length]]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function shortMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short" });
}

export function ActivityArea({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const palette = usePalette();
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.areaFill} stopOpacity={0.45} />
              <stop offset="100%" stopColor={palette.areaFill} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={palette.grid} />
          <XAxis
            dataKey="name"
            tickFormatter={shortMonth}
            tickLine={false}
            axisLine={false}
            tick={{ fill: palette.tick, fontSize: 12 }}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: palette.tick, fontSize: 12 }}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: palette.grid }}
            content={
              <ChartTooltip
                formatter={(v) => `${v} application${v === 1 ? "" : "s"}`}
                palette={palette}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={palette.areaFill}
            strokeWidth={3}
            fill="url(#activityFill)"
            dot={{ r: 3, fill: palette.card, stroke: palette.areaFill, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: palette.areaFill, stroke: palette.card }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FunnelRows({
  funnel,
}: {
  funnel: { stage: string; count: number; reachRate: number; conversionFromPrevious: number | null }[];
}) {
  const forward = funnel.filter((f) => f.stage !== "rejected");
  const rejected = funnel.find((f) => f.stage === "rejected");
  const max = Math.max(1, ...forward.map((f) => f.count));
  return (
    <div className="space-y-4">
      {forward.map((f) => (
        <div key={f.stage}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <StatusStamp status={f.stage} />
            <span className="font-display tnum text-2xl font-bold">{f.count}</span>
            <span className="tnum text-sm text-muted-foreground">
              {f.reachRate}% of total
            </span>
            {f.conversionFromPrevious !== null && (
              <span className="tnum ml-auto text-sm font-medium text-muted-foreground">
                {f.conversionFromPrevious}% carry over
              </span>
            )}
          </div>
          <div className="mt-1.5 h-[6px]">
            <div
              className="h-full rounded-full bg-[#FFB800] dark:bg-[#FFB800]"
              style={{ width: `${Math.max(4, Math.round((f.count / max) * 100))}%` }}
            />
          </div>
        </div>
      ))}
      {rejected && rejected.count > 0 && (
        <p className="tnum pt-1 text-sm text-muted-foreground">
          Rejected: {rejected.count} ({rejected.reachRate}% of total), filed
          separately.
        </p>
      )}
    </div>
  );
}
