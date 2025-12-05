import Image from "next/image";

export const ProfileSummary = ({ user }) => (
  <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
    <div className="relative h-14 w-14 overflow-hidden rounded-2xl">
      <Image
        src={
          user?.avatarUrl ||
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
        }
        alt={user?.name || "User avatar"}
        fill
        className="object-cover"
      />
    </div>
    <div>
      <p className="text-sm uppercase tracking-widest text-white/50">
        Identity
      </p>
      <p className="text-lg font-semibold text-white">
        {user?.name || "Guest"}
      </p>
      <p className="text-xs text-white/60">
        {user?.handle ? `@${user.handle}` : "Handle pending"}
      </p>
    </div>
  </div>
);
