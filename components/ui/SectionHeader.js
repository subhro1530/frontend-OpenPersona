const SectionHeader = ({ eyebrow, title, description, actions }) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-smoke/70">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      {description && <p className="text-sm text-white/70">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
  </header>
);

export default SectionHeader;
