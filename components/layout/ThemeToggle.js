"use client";

import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("contrast", highContrast);
  }, [highContrast]);

  return (
    <button
      onClick={() => setHighContrast((prev) => !prev)}
      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white/70 hover:border-white"
      aria-pressed={highContrast}
    >
      {highContrast ? "Standard Mode" : "High Contrast"}
    </button>
  );
};

export default ThemeToggle;
