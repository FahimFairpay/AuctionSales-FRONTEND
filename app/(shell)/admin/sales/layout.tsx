import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sales" };

export default function AdminSalesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
