import { Background } from "@/components/background";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Background className="via-muted to-muted/80">
      <section className="container py-20 lg:py-24">
        <DashboardHeader />
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <DashboardSidebar />
          <div className="lg:col-span-9 space-y-6">
            {children}
          </div>
        </div>
      </section>
    </Background>
  );
}
