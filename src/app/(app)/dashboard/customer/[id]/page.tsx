export default async function CustomerDashboard({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <div>Customer Dashboard {id}</div>;
}
