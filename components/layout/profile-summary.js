import Image from "next/image";

export const ProfileSummary = ({ user }) => {
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Loading...";
  const displayHandle = user?.handle || user?.id?.slice(0, 8) || "...";
  const displayEmail = user?.email || "";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-2xl">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyber/30 to-aurora/30 text-lg font-bold text-white">
              {getInitials(displayName)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-white truncate">
            {displayName}
          </p>
          <p className="text-sm text-cyber truncate">@{displayHandle}</p>
        </div>
      </div>
      {displayEmail && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-white/40 truncate">{displayEmail}</p>
        </div>
      )}
      {user?.role === "admin" && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-aurora/20 px-2 py-0.5 text-xs text-aurora">
            <span>🛡️</span> Admin
          </span>
        </div>
      )}
    </div>
  );
};
