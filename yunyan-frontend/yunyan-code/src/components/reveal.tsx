"use client";

import { useRef } from "react";

import { motion, useInView } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  direction?: "left" | "right" | "up" | "down" | "none";
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
}

export const Reveal = ({
  children,
  width = "100%",
  direction = "up",
  delay = 0.2,
  duration = 0.6,
  className,
  distance = 40,
}: RevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  const variants = {
    hidden: {
      opacity: 0,
      filter: "blur(8px)",
      scale: 0.98,
      x: direction === "left" ? -distance : direction === "right" ? distance : 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <div ref={ref} className={className} style={{ width, position: "relative" }}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for a "snappy yet smooth" feel
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
