import clsx from "clsx";

const Tag = ({ children, className, tone = "default" }) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide",
      tone === "positive" && "border-cyber/40 text-cyber",
      tone === "warn" && "border-orange-400/40 text-orange-300",
      tone === "default" && "border-white/10 text-white/70",
      className
    )}
  >
    {children}
  </span>
);

export default Tag;
