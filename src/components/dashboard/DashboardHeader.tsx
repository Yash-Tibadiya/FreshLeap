import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";

type Farmer = {
  farmer_id: string;
  user_id: string;
  farm_name: string;
  farm_location: string;
  contact_number: string;
  created_at: Date;
  updated_at: Date;
  user?: {
    username: string;
    email: string;
  };
};

export function DashboardHeader({ farmer }: { farmer: Farmer }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-green-500">
          <AvatarImage src={`https://avatar.vercel.sh/${farmer.farm_name}`} />
          <AvatarFallback className="bg-green-100 text-green-800 text-xl">
            {farmer.farm_name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{farmer.farm_name}</h1>
          <p className="text-gray-500">{farmer.farm_location}</p>
        </div>
      </div>
      <Button className="bg-green-600 hover:bg-green-700">
        <Pencil className="mr-2 h-4 w-4" />
        Edit Profile
      </Button>
    </div>
  );
}