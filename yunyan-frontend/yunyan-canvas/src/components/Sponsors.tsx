import { Radar, Command, Globe, Zap, Hexagon, Component, Box, Activity } from "lucide-react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

interface SponsorProps {
  icon: JSX.Element;
  name: string;
}

const sponsors: SponsorProps[] = [
  {
    icon: <Radar className="w-8 h-8" />,
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

export const Sponsors = () => {
  return (
    <section
      id="sponsors"
      className="container py-8 sm:py-10"
    >
      <h2 className="text-center text-xs font-bold mb-4 text-muted-foreground/60 uppercase tracking-widest">
        Trusted by industry leaders
      </h2>

      <div className="h-[5rem] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={sponsors}
          direction="right"
          speed="slow"
        />
      </div>
    </section>
  );
};
