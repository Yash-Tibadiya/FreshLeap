export default async function FarmerDashboard({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <div>Farmer Dashboard {id}</div>;
}
