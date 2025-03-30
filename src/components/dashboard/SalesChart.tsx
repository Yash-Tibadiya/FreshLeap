import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SalesChart() {
  const chartData = {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    sales: [4500, 3800, 5100, 4900, 6200, 5800],
  };
  
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Monthly sales performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {chartData.months.map((month, i) => (
            <div key={month} className="flex flex-col items-center gap-2">
              <div
                className="bg-green-500 rounded-t-md w-12"
                style={{ height: `${chartData.sales[i] / 100}px` }}
              ></div>
              <span className="text-xs text-gray-500">{month}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}