import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import ProfileForm from "./components/profile-form";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <Heading
        title="Profile"
        description="Update your profile settings."
        className="!text-lg font-medium"
      />
      <Separator />
      <ProfileForm />
    </div>
  );
}
