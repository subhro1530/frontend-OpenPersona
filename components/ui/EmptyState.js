const EmptyState = ({ title, message, action }) => (
  <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-white/70">
    <p className="text-lg font-semibold text-white">{title}</p>
    <p className="mt-2 text-sm">{message}</p>
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
