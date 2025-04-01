"use client";

import React, { useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type MonthlySalesData = {
  month: string;
  sales: number;
};

interface SalesChartProps {
  monthlySales?: MonthlySalesData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white py-2 px-4 rounded-md shadow-lg">
        <p className="font-medium">{label}</p>
        <p>Sales: ${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function SalesChart({ monthlySales = [] }: SalesChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Format data for the chart
  const chartData = useMemo(() => {
    if (!monthlySales || monthlySales.length === 0) {
      // Sample data similar to Image 2
      return [
        { month: "Jan", sales: 186 },
        { month: "Feb", sales: 305 },
        { month: "Mar", sales: 237 },
        { month: "Apr", sales: 73 },
        { month: "May", sales: 209 },
        { month: "Jun", sales: 214 },
      ];
    }
    return monthlySales;
  }, [monthlySales]);

  // Calculate trend percentage
  const trend = useMemo(() => {
    if (chartData.length < 2) return { value: 0, up: true };

    const lastMonth = chartData[chartData.length - 1].sales;
    const prevMonth = chartData[chartData.length - 2].sales;

    if (prevMonth === 0) return { value: 0, up: true };

    const change = ((lastMonth - prevMonth) / prevMonth) * 100;
    return {
      value: Math.abs(Math.round(change)),
      up: change >= 0,
    };
  }, [chartData]);

  // Handle mouse events for hover effect
  const handleMouseEnter = ( index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card className="border-none shadow-md text-white">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription className="text-gray-400">
          Monthly sales performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{
                top: 30,
                right: 30,
                left: 20,
                bottom: 20,
              }}
              barCategoryGap={16}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#444"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                stroke="#888"
              />
              <YAxis
                tickFormatter={(value) => `$${value}`}
                axisLine={false}
                tickLine={false}
                stroke="#888"
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                dataKey="sales"
                radius={[4, 4, 0, 0]}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={activeIndex === index ? "#fff" : "#16a34a"} // white on hover, green-600 default
                  />
                ))}
                <LabelList
                  dataKey="sales"
                  position="top"
                  fill="#fff"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-400">No sales data available</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none items-center">
          {trend.up ? (
            <>
              Trending up by {trend.value}% this month
              <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
            </>
          ) : (
            <>
              Trending down by {trend.value}% this month
              <TrendingDown className="h-4 w-4 text-red-500 ml-1" />
            </>
          )}
        </div>
        <div className="leading-none text-gray-400">
          Showing total sales for the last {chartData.length} months
        </div>
      </CardFooter>
    </Card>
  );
}