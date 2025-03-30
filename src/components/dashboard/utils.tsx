import { Badge } from "@/components/ui/badge";

// Helper function to format date
export const formatDate = (dateString: Date | string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to render status badge
export const renderStatusBadge = (status: string) => {
  let badgeClass = "bg-gray-100 text-gray-800";
  switch (status) {
    case "pending":
      badgeClass = "bg-yellow-100 text-yellow-800";
      break;
    case "shipped":
      badgeClass = "bg-blue-100 text-blue-800";
      break;
    case "completed":
      badgeClass = "bg-green-100 text-green-800";
      break;
    case "cancelled":
      badgeClass = "bg-red-100 text-red-800";
      break;
    // Add cases for product status if needed, e.g., 'in stock', 'out of stock'
    case "in stock":
      badgeClass = "bg-green-100 text-green-800";
      break;
    case "out of stock":
      badgeClass = "bg-red-100 text-red-800";
      break;
  }
  return (
    <Badge
      className={`capitalize ${badgeClass} border-none px-2.5 py-0.5 text-xs font-medium`}
    >
      {status}
    </Badge>
  );
};