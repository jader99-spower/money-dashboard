import Sidebar from "@/components/Sidebar";
import DashboardProviders from "@/components/DashboardProviders";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProviders>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: "var(--bg-base)" }}
      >
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </DashboardProviders>
  );
}
