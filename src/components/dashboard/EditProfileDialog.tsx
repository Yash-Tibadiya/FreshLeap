import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Farmer } from "./types";

interface EditProfileDialogProps {
  farmer: Farmer;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (updatedFarmer: Farmer) => void;
}

export function EditProfileDialog({
  farmer,
  isOpen,
  onOpenChange,
  onProfileUpdate,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    farm_name: farmer.farm_name,
    farm_location: farmer.farm_location,
    contact_number: farmer.contact_number,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/farmers/${farmer.farmer_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farm_name: formData.farm_name,
          farm_location: formData.farm_location,
          contact_number: formData.contact_number,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();

      // Update the farmer data in the parent component
      onProfileUpdate({
        ...farmer,
        farm_name: formData.farm_name,
        farm_location: formData.farm_location,
        contact_number: formData.contact_number,
      });

      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Farm Profile</DialogTitle>
          <DialogDescription>
            Update your farm details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="farm_name" className="text-right">
                Farm Name
              </Label>
              <Input
                id="farm_name"
                name="farm_name"
                value={formData.farm_name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="farm_location" className="text-right">
                Location
              </Label>
              <Input
                id="farm_location"
                name="farm_location"
                value={formData.farm_location}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_number" className="text-right">
                Contact
              </Label>
              <Input
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
