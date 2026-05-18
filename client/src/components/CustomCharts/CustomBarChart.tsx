import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface CustomBarChartProps {
  data: any[];
  width?: number | string;
  height?: number | string;
  layout?: "horizontal" | "vertical";
  xAxisDataKey?: string;
  yAxisDataKey?: string;
  barDataKey: string;
  barSize?: number;
  radius?: [number, number, number, number];
  fill?: string;
  margin?: { top: number; right: number; left: number; bottom: number };
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  tickSize?: number;
  yAxisWidth?: number;
  customTooltip?: boolean;
  customTooltipCursor?: any;
  customTooltipContentStyle?: React.CSSProperties;
  customTooltipItemStyle?: React.CSSProperties;
  useResponsiveContainer?: boolean;
  cells?: Array<{ fill: string }>;
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({
  data,
  width = "100%",
  height = 250,
  layout = "horizontal",
  xAxisDataKey,
  yAxisDataKey,
  barDataKey,
  barSize = 40,
  radius = [6, 6, 0, 0],
  fill = "var(--brand)",
  margin,
  hideXAxis = false,
  hideYAxis = true,
  tickSize = 10,
  yAxisWidth,
  customTooltip = true,
  customTooltipCursor,
  customTooltipContentStyle,
  customTooltipItemStyle,
  useResponsiveContainer = false,
  cells,
}) => {
  const chartElement = (
    <BarChart
      width={typeof width === "number" ? width : undefined}
      height={typeof height === "number" ? height : undefined}
      data={data}
      layout={layout}
      margin={margin}
    >
      {!hideXAxis && (
        <XAxis
          dataKey={layout === "horizontal" ? xAxisDataKey : undefined}
          type={layout === "vertical" ? "number" : "category"}
          hide={layout === "vertical"}
          stroke="var(--text-muted)"
          fontSize={tickSize}
          tickLine={false}
          axisLine={false}
          dy={layout === "horizontal" ? 10 : 0}
        />
      )}

      {!hideYAxis && (
        <YAxis
          dataKey={layout === "vertical" ? yAxisDataKey : undefined}
          type={layout === "vertical" ? "category" : "number"}
          stroke="var(--text-muted)"
          fontSize={tickSize}
          tickLine={false}
          axisLine={false}
          width={yAxisWidth}
        />
      )}

      {customTooltip && (
        <Tooltip
          cursor={customTooltipCursor}
          contentStyle={customTooltipContentStyle}
          itemStyle={customTooltipItemStyle}
        />
      )}

      <Bar dataKey={barDataKey} fill={fill} radius={radius} barSize={barSize}>
        {cells &&
          cells.map((cell, index) => (
            <Cell key={`cell-${index}`} fill={cell.fill} />
          ))}
      </Bar>
    </BarChart>
  );

  if (useResponsiveContainer) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        {chartElement}
      </ResponsiveContainer>
    );
  }

  return chartElement;
};

export default CustomBarChart;
