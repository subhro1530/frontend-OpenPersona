"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

const NeonButton = ({
  children,
  className,
  icon: Icon,
  as: Component = "button",
  ...props
}) => {
  const MotionComponent = motion(Component);
  return (
    <MotionComponent
      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,247,255,0.6)" }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        "group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-aurora to-pulse px-6 py-3 text-sm font-semibold text-white shadow-neon transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </MotionComponent>
  );
};

export default NeonButton;
