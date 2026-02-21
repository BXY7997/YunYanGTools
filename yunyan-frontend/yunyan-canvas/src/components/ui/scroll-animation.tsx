import { motion } from "framer-motion";

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
  const directions = {
    left: { x: -50, y: 0 }, // Reduced distance for smoother feel
    right: { x: 50, y: 0 },
    up: { x: 0, y: 50 },
    down: { x: 0, y: -50 },
  };

  const initial = { opacity: 0, ...directions[direction] };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }} // Trigger slightly earlier
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }} // Custom easing (quintOut-ish)
      className={className}
    >
      {children}
    </motion.div>
  );
};
