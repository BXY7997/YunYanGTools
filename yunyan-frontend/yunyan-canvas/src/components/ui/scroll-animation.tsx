import { motion, useReducedMotion } from "framer-motion";

interface ScrollAnimationProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  className?: string;
  delay?: number;
}

export const ScrollAnimation = ({ 
  children, 
  direction = "up", 
  className = "",
  delay = 0 
}: ScrollAnimationProps) => {
  const prefersReducedMotion = useReducedMotion();
  const directions = {
    left: { x: -36, y: 0 },
    right: { x: 36, y: 0 },
    up: { x: 0, y: 36 },
    down: { x: 0, y: -36 },
  };

  const initial = { opacity: 0, ...directions[direction] };
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-64px", amount: 0.2 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
