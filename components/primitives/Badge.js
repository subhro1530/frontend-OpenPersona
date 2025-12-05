import clsx from "clsx";

export const Badge = ({ children, tone = "info" }) => (
  <span
    className={clsx(
      "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
      tone === "info" && "bg-aurora/20 text-aurora",
      tone === "warn" && "bg-orange-500/20 text-orange-200",
      tone === "success" && "bg-cyber/20 text-cyber"
    )}
  >
    {children}
  </span>
);
