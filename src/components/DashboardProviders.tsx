"use client";

import { AssetProvider } from "@/context/AssetContext";

export default function DashboardProviders({ children }: { children: React.ReactNode }) {
  return <AssetProvider>{children}</AssetProvider>;
}
