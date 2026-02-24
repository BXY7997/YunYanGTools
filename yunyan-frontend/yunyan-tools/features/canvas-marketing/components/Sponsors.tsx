import { Target, Command, Globe, Zap, Hexagon, Component, Box, Activity } from "lucide-react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

interface SponsorProps {
  icon: JSX.Element;
  name: string;
}

interface TrustSignalProps {
  label: string;
  value: string;
}

const sponsors: SponsorProps[] = [
  {
    icon: <Target className="w-8 h-8" />,
    name: "TechVision",
  },
  {
    icon: <Command className="w-8 h-8" />,
    name: "CmdShift",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    name: "GlobalNet",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    name: "FastScale",
  },
  {
    icon: <Hexagon className="w-8 h-8" />,
    name: "PolyGon",
  },
  {
    icon: <Component className="w-8 h-8" />,
    name: "ReactBase",
  },
  {
    icon: <Box className="w-8 h-8" />,
    name: "CubeSystems",
  },
  {
    icon: <Activity className="w-8 h-8" />,
    name: "PulseHealth",
  },
];

const trustSignals: TrustSignalProps[] = [
  { value: "500+", label: "企业客户" },
  { value: "12", label: "覆盖行业" },
  { value: "99.95%", label: "可用性 SLA" },
];

export const Sponsors = () => {
  return (
    <section
      id="sponsors"
      className="container home-section-spacing-compact"
    >
      <h2 className="home-kicker mb-5 text-center">
        Trusted by industry leaders
      </h2>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {trustSignals.map((signal) => (
          <div
            key={signal.label}
            className="home-card-surface px-4 py-3 text-center"
          >
            <div className="text-xl font-extrabold tracking-tight text-foreground">{signal.value}</div>
            <div className="text-[11px] font-semibold tracking-wide text-muted-foreground">{signal.label}</div>
          </div>
        ))}
      </div>

      <div className="home-card-surface mb-4 flex h-[5.5rem] flex-col items-center justify-center overflow-hidden rounded-2xl antialiased">
        <InfiniteMovingCards
          items={sponsors}
          direction="right"
          speed="slow"
        />
      </div>

      <p className="mx-auto max-w-2xl text-center text-sm leading-6 text-muted-foreground">
        “我们在 2 周内完成了跨部门架构共识，评审效率提升明显。”{" "}
        <span className="font-semibold text-foreground/80">— 某制造企业数字化负责人</span>
      </p>
    </section>
  );
};
