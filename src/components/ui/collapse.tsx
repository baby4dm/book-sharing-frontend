import { useState, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { collapseMotion } from "@/lib/motion";

export default function Collapse({
  children,
  as = "div",
  ...props
}: { children: ReactNode; as?: "div" | "li" } & HTMLMotionProps<"div">) {
  const [settled, setSettled] = useState(false);
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp
      {...collapseMotion}
      {...(props as object)}
      style={{ overflow: settled ? "visible" : "hidden", ...props.style }}
      onAnimationStart={() => setSettled(false)}
      onAnimationComplete={() => setSettled(true)}
    >
      {children}
    </Comp>
  );
}
