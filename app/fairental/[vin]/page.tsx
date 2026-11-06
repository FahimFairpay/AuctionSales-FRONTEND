import { FairentalDetailPage } from "@/views/fairental/FairentalDetailPage";

export default async function FairentalVinPage({ params }: { params: Promise<{ vin: string }> }) {
  const { vin } = await params;
  return <FairentalDetailPage vin={decodeURIComponent(vin)} />;
}
