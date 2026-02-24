import { motion, useReducedMotion } from "framer-motion";

const FLOAT_TRANSITION = {
  duration: 22,
  repeat: Infinity,
  ease: "easeInOut",
} as const;

export const HomePageBackdrop = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(59,130,246,0.09),transparent_44%)] dark:bg-[radial-gradient(circle_at_8%_0%,rgba(96,165,250,0.16),transparent_48%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_24%,rgba(99,102,241,0.08),transparent_46%)] dark:bg-[radial-gradient(circle_at_85%_24%,rgba(129,140,248,0.14),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_78%,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_45%_78%,rgba(96,165,250,0.1),transparent_56%)]" />

      <motion.div
        className="absolute -top-24 left-[-12%] h-72 w-72 rounded-full bg-blue-200/35 blur-[100px] dark:bg-blue-500/22"
        animate={
          prefersReducedMotion ? undefined : { x: [0, 60, 0], y: [0, -30, 0] }
        }
        transition={prefersReducedMotion ? undefined : FLOAT_TRANSITION}
      />
      <motion.div
        className="absolute top-[35%] right-[-10%] h-72 w-72 rounded-full bg-indigo-200/35 blur-[100px] dark:bg-indigo-500/20"
        animate={
          prefersReducedMotion ? undefined : { x: [0, -52, 0], y: [0, 38, 0] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { ...FLOAT_TRANSITION, duration: 26, delay: 2 }
        }
      />
      <motion.div
        className="absolute bottom-[-12%] left-[32%] h-64 w-64 rounded-full bg-sky-200/30 blur-[100px] dark:bg-sky-500/16"
        animate={
          prefersReducedMotion ? undefined : { x: [0, 45, 0], y: [0, -32, 0] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { ...FLOAT_TRANSITION, duration: 24, delay: 4 }
        }
      />
    </div>
  );
};

export default HomePageBackdrop;
