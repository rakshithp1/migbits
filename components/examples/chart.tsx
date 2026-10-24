"use client";
// Composed with shadcn/ui's MIT chart primitives and Recharts. See ../ui/LICENSE.
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../ui/chart";

const data = [
  { month: "May", design: 186, development: 80 },
  { month: "Jun", design: 305, development: 200 },
  { month: "Jul", design: 237, development: 120 },
  { month: "Aug", design: 173, development: 190 },
  { month: "Sep", design: 209, development: 130 },
  { month: "Oct", design: 248, development: 170 },
];
const config = {
  design: { label: "Design", color: "var(--chart-1)" },
  development: { label: "Development", color: "var(--chart-2)" },
} satisfies ChartConfig;
export default function ChartExample() {
  return (
    <div className="grid w-full gap-6">
      <div>
        <p className="mb-2 text-xs text-muted-foreground">A LITTLE MOMENTUM</p>
        <h3 className="text-xl font-medium tracking-tight">
          Good ideas, taking shape.
        </h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Illustrative project activity · May—October
        </p>
      </div>
      <ChartContainer config={config} className="h-56 w-full">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="design"
            fill="var(--color-design)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="development"
            fill="var(--color-development)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
