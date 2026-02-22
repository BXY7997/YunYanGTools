import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { HomeSectionTone } from "@/components/home/HomeSectionShell";

type HomeSectionComponent =
  | ComponentType
  | LazyExoticComponent<ComponentType>;

const Sponsors = lazy(async () => {
  const module = await import("@/components/Sponsors");
  return { default: module.Sponsors };
});
const Services = lazy(async () => {
  const module = await import("@/components/Services");
  return { default: module.Services };
});
const Features = lazy(async () => {
  const module = await import("@/components/Features");
  return { default: module.Features };
});
const Testimonials = lazy(async () => {
  const module = await import("@/components/Testimonials");
  return { default: module.Testimonials };
});
const About = lazy(async () => {
  const module = await import("@/components/About");
  return { default: module.About };
});
const Pricing = lazy(async () => {
  const module = await import("@/components/Pricing");
  return { default: module.Pricing };
});
const FAQ = lazy(async () => {
  const module = await import("@/components/FAQ");
  return { default: module.FAQ };
});
const HowItWorks = lazy(async () => {
  const module = await import("@/components/HowItWorks");
  return { default: module.HowItWorks };
});
const Cta = lazy(async () => {
  const module = await import("@/components/Cta");
  return { default: module.Cta };
});

export interface HomeSectionConfig {
  id: string;
  tone: HomeSectionTone;
  component: HomeSectionComponent;
  eager?: boolean;
  deferUntilVisible?: boolean;
  divider?: boolean;
  shellClassName?: string;
}

export const HOME_SECTION_CONFIG: HomeSectionConfig[] = [
  {
    id: "sponsors",
    tone: "plain",
    component: Sponsors,
    divider: false,
    eager: true,
  },
  {
    id: "services",
    tone: "soft",
    component: Services,
    eager: true,
  },
  {
    id: "features",
    tone: "accent",
    component: Features,
    eager: true,
  },
  {
    id: "testimonials",
    tone: "plain",
    component: Testimonials,
    deferUntilVisible: true,
  },
  {
    id: "about",
    tone: "soft",
    component: About,
    deferUntilVisible: true,
  },
  {
    id: "pricing",
    tone: "plain",
    component: Pricing,
    deferUntilVisible: true,
  },
  {
    id: "faq",
    tone: "soft",
    component: FAQ,
    deferUntilVisible: true,
  },
  {
    id: "how-it-works",
    tone: "plain",
    component: HowItWorks,
    deferUntilVisible: true,
  },
  {
    id: "cta",
    tone: "contrast",
    component: Cta,
    deferUntilVisible: true,
    shellClassName: "pt-4 sm:pt-6",
  },
];
