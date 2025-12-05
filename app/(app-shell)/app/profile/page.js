import ProfileEditor from "@/components/profile/ProfileEditor";
import SectionHeader from "@/components/ui/SectionHeader";

const ProfilePage = () => (
  <div className="space-y-8">
    <SectionHeader
      eyebrow="Profile"
      title="Manage metadata, handles, templates"
    />
    <ProfileEditor />
  </div>
);

export default ProfilePage;
