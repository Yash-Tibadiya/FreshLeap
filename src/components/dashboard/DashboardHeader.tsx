import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";
import { EditProfileDialog } from "./EditProfileDialog";
import { Farmer } from "./types";

interface DashboardHeaderProps {
  farmer: Farmer;
  onProfileUpdate?: (updatedFarmer: Farmer) => void;
}

export function DashboardHeader({
  farmer,
  onProfileUpdate,
}: DashboardHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleProfileUpdate = (updatedFarmer: Farmer) => {
    if (onProfileUpdate) {
      onProfileUpdate(updatedFarmer);
    }
  };

  return (
    <>
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
            <p className="text-gray-500 text-sm mt-1">
              Contact: {farmer.contact_number}
            </p>
          </div>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <EditProfileDialog
        farmer={farmer}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}
