import type { Transition } from "motion/react";

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const springGlide: Transition = {
  type: "spring",
  duration: 0.38,
  bounce: 0.12,
};

export const springPop: Transition = {
  type: "spring",
  duration: 0.32,
  bounce: 0.3,
};

export const springSheet: Transition = {
  type: "spring",
  duration: 0.42,
  bounce: 0.06,
};

export const dropdownMotion = {
  initial: { opacity: 0, transform: "translateY(-4px) scale(0.98)" },
  animate: {
    opacity: 1,
    transform: "translateY(0px) scale(1)",
    transition: { duration: 0.16, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    transform: "translateY(-4px) scale(0.98)",
    transition: { duration: 0.1, ease: EASE_OUT },
  },
} as const;

export const listItemMotion = {
  initial: { opacity: 0, transform: "translateY(6px)" },
  animate: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: 0.22, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    transform: "scale(0.98)",
    transition: { duration: 0.14, ease: EASE_OUT },
  },
} as const;

export const collapseMotion = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.24, ease: EASE_OUT },
      opacity: { duration: 0.18, delay: 0.04 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.18, ease: EASE_OUT },
      opacity: { duration: 0.1 },
    },
  },
} as const;

export const swapMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
} as const;
