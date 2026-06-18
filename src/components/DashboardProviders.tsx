"use client";

import { SessionProvider } from "next-auth/react";
import { AssetProvider } from "@/context/AssetContext";

export default function DashboardProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AssetProvider>{children}</AssetProvider>
    </SessionProvider>
  );
}
