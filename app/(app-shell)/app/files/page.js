import FileManager from "@/components/files/FileManager";
import SectionHeader from "@/components/ui/SectionHeader";

const FilesPage = () => (
  <div className="space-y-8">
    <SectionHeader eyebrow="Media" title="Vultr-backed file grid" />
    <FileManager />
  </div>
);

export default FilesPage;
