import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  Users as UsersIcon,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StatsType = {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
};

export function OverviewCards({ stats }: { stats: StatsType }) {
  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <Package className="h-5 w-5 text-blue-600" />,
      description: "Active products in your inventory",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingCart className="h-5 w-5 text-purple-600" />,
      description: "Orders received this month",
      change: "+18.2%",
      changeType: "positive",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: <UsersIcon className="h-5 w-5 text-orange-600" />,
      description: "Unique customers",
      change: "+5.7%",
      changeType: "positive",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      description: "Revenue this month",
      change: "+22.3%",
      changeType: "positive",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
              </div>
              <div className="p-2 rounded-full bg-gray-100">{card.icon}</div>
            </div>
            <div className="flex items-center mt-4">
              <Badge
                variant={
                  card.changeType === "positive" ? "default" : "destructive"
                }
                className="bg-green-100 text-green-800 hover:bg-green-100"
              >
                {card.change}
              </Badge>
              <p className="text-xs text-gray-500 ml-2">{card.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}