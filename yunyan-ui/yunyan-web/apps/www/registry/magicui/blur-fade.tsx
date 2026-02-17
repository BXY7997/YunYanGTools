"use client"

import { useRef } from "react"
import {
  AnimatePresence,
  motion,
  MotionProps,
  useInView,
  UseInViewOptions,
  useReducedMotion,
  Variants,
} from "motion/react"

type MarginType = UseInViewOptions["margin"]

interface BlurFadeProps extends MotionProps {
  children: React.ReactNode
  className?: string
  variant?: {
    hidden: { y: number }
    visible: { y: number }
  }
  duration?: number
  delay?: number
  offset?: number
  direction?: "up" | "down" | "left" | "right"
  inView?: boolean
  inViewMargin?: MarginType
  blur?: string
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = "down",
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
  ...props
}: BlurFadeProps) {
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin })
  const isInView = shouldReduceMotion ? true : !inView || inViewResult
  const defaultVariants: Variants = {
    hidden: {
      [direction === "left" || direction === "right" ? "x" : "y"]:
        direction === "right" || direction === "down" ? -offset : offset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: {
      [direction === "left" || direction === "right" ? "x" : "y"]: 0,
      opacity: 1,
      filter: `blur(0px)`,
    },
  }

  const reduceMotionVariants: Variants = {
    hidden: {
      x: 0,
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
  }

  const combinedVariants = variant || defaultVariants
  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={shouldReduceMotion ? false : "hidden"}
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={shouldReduceMotion ? reduceMotionVariants : combinedVariants}
        transition={{
          delay: shouldReduceMotion ? 0 : 0.04 + delay,
          duration: shouldReduceMotion ? 0 : duration,
          ease: "easeOut",
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
