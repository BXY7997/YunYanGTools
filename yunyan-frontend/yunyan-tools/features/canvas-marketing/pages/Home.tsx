import { Suspense, lazy } from "react";
import { DeferredRender } from "@canvas/components/home/DeferredRender";
import { HomePageBackdrop } from "@canvas/components/home/HomePageBackdrop";
import { HomeSectionShell } from "@canvas/components/home/HomeSectionShell";
import { HOME_SECTION_CONFIG } from "./home-sections";

const Hero3D = lazy(() => import("@canvas/components/Hero3D"));

const HeroFallback = () => (
  <section
    aria-label="Loading hero"
    className="relative flex min-h-[72vh] items-center justify-center overflow-hidden pt-16 lg:pt-20"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(59,130,246,0.12),transparent_44%)]" />
    <div className="container relative z-10 space-y-6 text-center">
      <div className="mx-auto h-7 w-60 animate-pulse rounded-full bg-blue-100/80 dark:bg-blue-900/35" />
      <div className="mx-auto h-14 w-[min(760px,90%)] animate-pulse rounded-2xl bg-muted/55" />
      <div className="mx-auto h-7 w-[min(520px,82%)] animate-pulse rounded-2xl bg-muted/45" />
      <div className="mx-auto mt-4 h-[320px] w-full max-w-5xl animate-pulse rounded-2xl border border-border/70 bg-card/80" />
    </div>
  </section>
);

const HomeSectionFallback = () => (
  <div className="container home-section-spacing-compact" aria-hidden>
    <div className="home-card-surface h-24 animate-pulse bg-muted/40" />
  </div>
);

export const Home = () => {
  return (
    <main className="relative isolate overflow-hidden">
      <Suspense fallback={<HeroFallback />}>
        <Hero3D />
      </Suspense>
      <HomePageBackdrop />

      {HOME_SECTION_CONFIG.map(
        ({
          id,
          tone,
          component: SectionComponent,
          eager,
          deferUntilVisible,
          divider,
          shellClassName,
        }) => {
          const shouldEagerRender = Boolean(eager) || !deferUntilVisible;
          return (
            <HomeSectionShell
              key={id}
              tone={tone}
              divider={divider}
              className={shellClassName}
            >
              <DeferredRender
                eager={shouldEagerRender}
                placeholder={<HomeSectionFallback />}
              >
                <Suspense fallback={<HomeSectionFallback />}>
                  <SectionComponent />
                </Suspense>
              </DeferredRender>
            </HomeSectionShell>
          );
        }
      )}
    </main>
  );
};

export default Home;
