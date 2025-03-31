import { Footer } from "@/components/Footer";
import FarmerDashboardClient from "./FarmerDashboardClient";

export default async function FarmerDashboard({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return (
    <>
      <FarmerDashboardClient farmerId={id} />
      <Footer />
    </>
  );
}
