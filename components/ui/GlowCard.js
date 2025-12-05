"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

const GlowCard = ({
  className,
  children,
  variant = "default",
  hover = true,
}) => (
  <motion.div
    whileHover={
      hover
        ? { scale: 1.02, boxShadow: "0 0 45px rgba(92, 77, 255, 0.35)" }
        : undefined
    }
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className={clsx(
      "glass relative overflow-hidden rounded-3xl border border-white/5 p-6 transition-colors",
      variant === "hero" &&
        "bg-gradient-to-br from-aurora/20 to-pulse/10 shadow-glow",
      variant === "panel" && "bg-night/70",
      className
    )}
  >
    <div className="pointer-events-none absolute inset-0 gradient-ring opacity-50" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

export default GlowCard;
