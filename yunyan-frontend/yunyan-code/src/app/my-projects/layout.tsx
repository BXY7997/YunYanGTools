import { Background } from "@/components/background";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Reveal } from "@/components/reveal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Background className="via-muted to-muted/80">
      <section className="container py-24 lg:py-28">
        <Reveal direction="up" delay={0.1}>
          <DashboardHeader />
        </Reveal>
        <div className="grid gap-8 lg:grid-cols-12 items-start mt-10">
          <aside className="lg:col-span-3">
            <Reveal direction="left" delay={0.2}>
              <DashboardSidebar />
            </Reveal>
          </aside>
          <main className="lg:col-span-9 space-y-6">
            <Reveal direction="right" delay={0.2}>
              {children}
            </Reveal>
          </main>
        </div>
      </section>
    </Background>
  );
}
